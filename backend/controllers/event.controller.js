require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION }); // ✅ đặt trước khi khởi tạo clients

const docClient = new AWS.DynamoDB.DocumentClient();

const path = require('path');
const crypto = require('crypto');
const s3 = new AWS.S3();

const BUCKET = process.env.S3_BUCKET; // graduation-avatar-bucket
const PREFIX = (process.env.S3_SLIDE_PREFIX || '').replace(/^\/+|\/+$/g, '') + '/'; // "template_ppt/"

// ========== S3 helpers (function declaration + export) ==========
function buildKey(unit_code, event_id, originalname) {
  const extFromName = path.extname(originalname || '');
  const ext = extFromName && extFromName.length <= 6 ? extFromName : '.png';
  const rand = crypto.randomBytes(4).toString('hex');
  return `${PREFIX}${unit_code}/${event_id}_${Date.now()}_${rand}${ext}`;
}

async function uploadSlide(file, unit_code, event_id) {
  if (!BUCKET) throw new Error('ENV S3_BUCKET is not set');
  if (!file || !file.buffer) throw new Error('Empty file buffer');

  const Key = buildKey(unit_code, event_id, file.originalname);

  await s3.putObject({
    Bucket: BUCKET,
    Key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000',
  }).promise();

  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
  return { Key, url };
}

function keyFromUrl(url) {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.replace(/^\/+/, ''));
  } catch {
    const i = url.indexOf('.amazonaws.com/');
    return i > 0 ? url.slice(i + '.amazonaws.com/'.length) : '';
  }
}

async function deleteByUrl(url) {
  if (!BUCKET) throw new Error('ENV S3_BUCKET is not set');
  if (!url) return;
  const Key = keyFromUrl(url);
  if (!Key) return;
  await s3.deleteObject({ Bucket: BUCKET, Key }).promise();
}

// (optional) export để debug
exports.BUCKET = BUCKET;
exports.PREFIX = PREFIX;
exports.buildKey = buildKey;
exports.uploadSlide = uploadSlide;
exports.keyFromUrl = keyFromUrl;
exports.deleteByUrl = deleteByUrl;

// ========== Helpers khác ==========
function getStatusFromTime(start, end) {
  const now = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);
  if (now < startTime) return 'upcoming';
  if (now >= startTime && now <= endTime) return 'ongoing';
  return 'finished';
}

const getLocationMap = async () => {
  const data = await docClient.scan({ TableName: 'locations' }).promise();
  const map = {};
  (data.Items || []).forEach(loc => {
    map[loc.location_id] = loc.location_name;
  });
  return map;
};

// ========== Controllers ==========
exports.getAllEvents = async (req, res) => {
  try {
    const eventData = await docClient.scan({ TableName: 'events' }).promise();
    const locationMap = await getLocationMap();

    const updatedItems = (eventData.Items || []).map(event => ({
      ...event,
      status: getStatusFromTime(event.start_time, event.end_time),
      location_name: locationMap[event.location_id] || 'Không rõ địa điểm',
    }));

    res.json(updatedItems);
  } catch (err) {
    console.error('❌ Lỗi getAllEvents:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách sự kiện' });
  }
};

// ✅ SỬA: lấy từ bảng locations, trả về danh sách địa điểm (id + name)
exports.getAllLocations = async (req, res) => {
  try {
    const data = await docClient.scan({ TableName: 'locations' }).promise();
    res.json(data.Items || []); // [{location_id, location_name}, ...]
  } catch (err) {
    console.error('❌ Lỗi lấy location:', err);
    res.status(500).json({ error: 'Lỗi lấy địa điểm' });
  }
};

// exports.getEventById = async (req, res) => {
//   try {
//     const { unit_code, event_id } = req.params;
//     const params = { TableName: 'events', Key: { unit_code, event_id: Number(event_id) } };
//     const data = await docClient.get(params).promise();
//     if (!data.Item) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
//     res.json(data.Item);
//   } catch (err) {
//     console.error('❌ Lỗi getEventById:', err);
//     res.status(500).json({ error: 'Lỗi truy xuất sự kiện' });
//   }
// };

exports.getEventById = async (req, res) => {
  try {
    // Lấy unit_code từ params hoặc query/body
    const unit_code =
      req.params.unit_code ||
      req.query.unit_code ||
      (req.body ? req.body.unit_code : undefined);

    // Lấy id từ :id / :event_id / query
    const rawId =
      req.params.id ??
      req.params.event_id ??
      req.query.id ??
      req.query.event_id;

    // Chuẩn hoá & validate là CHUỖI SỐ
    const idStr = rawId === undefined || rawId === null ? '' : String(rawId).trim();
    if (!unit_code) {
      return res.status(400).json({ error: 'Thiếu unit_code' });
    }
    if (!/^\d+$/.test(idStr)) {
      return res.status(400).json({ error: 'event_id không hợp lệ' });
    }
    const event_id = Number(idStr);

    const params = { TableName: 'events', Key: { unit_code, event_id } };
    const data = await docClient.get(params).promise();

    if (!data.Item) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
    res.json(data.Item);
  } catch (err) {
    console.error('❌ Lỗi getEventById:', {
      params: req.params,
      query: req.query,
      bodyKeys: Object.keys(req.body || {}),
      err,
    });
    res.status(500).json({ error: 'Lỗi truy xuất sự kiện' });
  }
};

// create
exports.createEvent = async (req, res) => {
  try {
    const b = req.body || {};
    const { title, description = '', start_time, end_time, location_id, unit_code } = b;
    if (!title || !start_time || !end_time || !location_id || !unit_code) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const loc = await docClient.get({
      TableName: 'locations',
      Key: { location_id: Number(location_id) },
    }).promise();
    if (!loc.Item) return res.status(400).json({ error: 'Không tìm thấy địa điểm' });

    const event_id = Date.now();

    let slide_template_url = '';
    if (req.file && req.file.buffer?.length) {
      const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!ok.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Ảnh PNG/JPG/WEBP' });
      }
      const { url } = await uploadSlide(req.file, unit_code, event_id);
      slide_template_url = url;
    }

    const item = {
      event_id,
      title,
      description,
      start_time,
      end_time,
      location_id: Number(location_id),
      location_name: loc.Item.location_name,
      slide_template_url,
      status: 'draft',
      unit_code,
    };

    await docClient.put({ TableName: 'events', Item: item }).promise();
    res.status(201).json(item);
  } catch (err) {
    console.error('❌ Lỗi createEvent:', err);
    res.status(500).json({ error: err.message || 'Lỗi tạo sự kiện' });
  }
};

// update
exports.updateEvent = async (req, res) => {
  try {
    const idNum = Number(req.params.id);
    const b = req.body || {};
    const { unit_code, title, description = '', start_time, end_time, location_id } = b;
    if (!unit_code || !title || !start_time || !end_time || !location_id) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const old = await docClient.get({ TableName: 'events', Key: { unit_code, event_id: idNum } }).promise();
    if (!old.Item) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });

    const loc = await docClient.get({
      TableName: 'locations',
      Key: { location_id: Number(location_id) },
    }).promise();
    if (!loc.Item) return res.status(400).json({ error: 'Không tìm thấy địa điểm' });

    // giữ url cũ mặc định
    let slide_template_url = old.Item.slide_template_url || '';

    // có file mới: upload trước, xóa cũ sau
    if (req.file && req.file.buffer?.length) {
      const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!ok.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Ảnh PNG/JPG/WEBP' });
      }
      const { url } = await uploadSlide(req.file, unit_code, idNum);
      try { if (slide_template_url) await deleteByUrl(slide_template_url); } catch (e) {}
      slide_template_url = url;
    }

    const params = {
      TableName: 'events',
      Key: { unit_code, event_id: idNum },
      UpdateExpression: `
        set #title=:t, #desc=:d, #start=:s, #end=:e,
            #loc_id=:lid, #loc_name=:lname, #slide=:slide
      `,
      ExpressionAttributeNames: {
        '#title': 'title',
        '#desc': 'description',
        '#start': 'start_time',
        '#end': 'end_time',
        '#loc_id': 'location_id',
        '#loc_name': 'location_name',
        '#slide': 'slide_template_url',
      },
      ExpressionAttributeValues: {
        ':t': title,
        ':d': description,
        ':s': start_time,
        ':e': end_time,
        ':lid': Number(location_id),
        ':lname': loc.Item.location_name,
        ':slide': slide_template_url,
      },
      ReturnValues: 'ALL_NEW',
    };

    const result = await docClient.update(params).promise();
    res.json(result.Attributes);
  } catch (err) {
    console.error('❌ Lỗi updateEvent:', err);
    res.status(500).json({ error: err.message || 'Lỗi cập nhật sự kiện' });
  }
};

// GET /events/:id/delete-check?unit_code=ABC
exports.checkCanDeleteEvent = async (req, res) => {
  try {
    const unitCode = req.query.unit_code;
    const rawId = req.params.id ?? req.params.event_id ?? req.query.id ?? req.query.event_id;
    const eventId = Number(rawId);

    if (!unitCode || !Number.isFinite(eventId)) {
      return res.status(400).json({ error: 'Thiếu unit_code hoặc event_id không hợp lệ' });
    }

    const key = { unit_code: unitCode, event_id: eventId };
    const old = await docClient.get({ TableName: 'events', Key: key }).promise();
    if (!old.Item) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });

    const registrationCount = await countRegistrationsByEvent(eventId);

    return res.json({
      canDelete: true,
      requiresConfirm: registrationCount > 0,
      registrationCount,
      message:
        registrationCount > 0
          ? 'Sự kiện có đăng ký. Nếu xác nhận, hệ thống sẽ xoá kèm toàn bộ registrations liên quan.'
          : 'Có thể xoá. Không có đăng ký nào.',
      event: { title: old.Item.title, start_time: old.Item.start_time, end_time: old.Item.end_time },
    });
  } catch (err) {
    console.error('❌ Lỗi checkCanDeleteEvent:', err);
    res.status(500).json({ error: 'Lỗi kiểm tra trước khi xoá' });
  }
};


const REG_TABLE = process.env.REG_TABLE || 'registrations';

// Đếm tổng registrations theo event_id (paginate COUNT để chắc chắn)
async function countRegistrationsByEvent(event_id) {
  let count = 0;
  let ExclusiveStartKey;
  do {
    const r = await docClient.query({
      TableName: REG_TABLE,
      KeyConditionExpression: 'event_id = :eid',
      ExpressionAttributeValues: { ':eid': event_id },
      Select: 'COUNT',
      ExclusiveStartKey,
    }).promise();
    count += r.Count || 0;
    ExclusiveStartKey = r.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return count;
}

// Lấy đúng Key để xoá: { event_id, user_code }
async function listRegistrationKeysByEvent(event_id) {
  const keys = [];
  let ExclusiveStartKey;
  do {
    const r = await docClient.query({
      TableName: REG_TABLE,
      KeyConditionExpression: 'event_id = :eid',
      ExpressionAttributeValues: { ':eid': event_id },
      ProjectionExpression: 'event_id, user_code',
      ExclusiveStartKey,
      Limit: 100,
    }).promise();
    (r.Items || []).forEach(it => keys.push({ event_id: it.event_id, user_code: it.user_code }));
    ExclusiveStartKey = r.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return keys;
}

// Batch delete 25 item/lần + retry UnprocessedItems (an toàn)
async function batchDeleteRegistrations(keys, { maxRetry = 5 } = {}) {
  if (!keys.length) return 0;
  let deleted = 0;
  for (let i = 0; i < keys.length; i += 25) {
    let chunk = keys.slice(i, i + 25);
    let attempt = 0;
    while (chunk.length && attempt < maxRetry) {
      const resp = await docClient.batchWrite({
        RequestItems: { [REG_TABLE]: chunk.map(Key => ({ DeleteRequest: { Key } })) },
      }).promise();
      const unprocessed = (resp.UnprocessedItems?.[REG_TABLE] || []).map(x => x.DeleteRequest.Key);
      deleted += chunk.length - unprocessed.length;
      chunk = unprocessed;
      if (chunk.length) {
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 8000)));
        attempt++;
      }
    }
  }
  return deleted;
}


exports.deleteEvent = async (req, res) => {
  try {
    const unitCode = req.query.unit_code;
    const rawId = req.params.id ?? req.params.event_id ?? req.query.id ?? req.query.event_id;
    const eventId = Number(rawId);
    const confirm = String(req.query.confirm || '').toLowerCase() === 'true';

    if (!unitCode) return res.status(400).json({ error: 'Thiếu unit_code' });
    if (!Number.isFinite(eventId)) return res.status(400).json({ error: 'event_id không hợp lệ' });

    const key = { unit_code: unitCode, event_id: eventId };
    const old = await docClient.get({ TableName: 'events', Key: key }).promise();
    if (!old.Item) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });

    const regCount = await countRegistrationsByEvent(eventId);
    if (regCount > 0 && !confirm) {
      return res.status(409).json({
        error: 'Sự kiện có người đăng ký. Xác nhận để xoá sự kiện kèm toàn bộ các đơn đăng kí.',
        requiresConfirm: true,
        registrationCount: regCount,
        next: 'Gọi lại DELETE với ?confirm=true',
      });
    }

    // Xoá registrations (nếu có)
    let deletedRegs = 0;
    if (regCount > 0) {
      const regKeys = await listRegistrationKeysByEvent(eventId); // <-- {event_id, user_code}
      deletedRegs = await batchDeleteRegistrations(regKeys);
    }

    // Xoá sự kiện
    await docClient.delete({ TableName: 'events', Key: key }).promise();

    // Xoá file S3 (nếu có) – không chặn luồng
    try { if (old.Item?.slide_template_url) await deleteByUrl(old.Item.slide_template_url); } catch {}

    res.json({
      message: '✅ Đã xoá sự kiện và registrations liên quan.',
      registrationsReported: regCount,
      registrationsDeleted: deletedRegs,
    });
  } catch (err) {
    console.error('❌ Lỗi deleteEvent:', err);
    res.status(500).json({ error: 'Lỗi xoá sự kiện' });
  }
};


// delete
// exports.deleteEvent = async (req, res) => {
//   try {
//     const unitCode = req.query.unit_code;
//     const eventId = Number(req.params.id);
//     if (!unitCode) return res.status(400).json({ error: 'Thiếu unit_code' });

//     const params = { TableName: 'events', Key: { unit_code: unitCode, event_id: eventId } };
//     await docClient.delete(params).promise();

//     res.json({ message: '✅ Đã xoá sự kiện' });
//   } catch (err) {
//     console.error('❌ Lỗi deleteEvent:', err);
//     res.status(500).json({ error: 'Lỗi xoá sự kiện' });
//   }
// };

