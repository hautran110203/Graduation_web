import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import { MagnifyingGlass } from '@phosphor-icons/react';
function SearchBox() {
  return (
    <Stack direction="horizontal" gap={2}>
      <Form.Control className="w-50" placeholder="Add your item here..." />
      <Button variant="link " ><MagnifyingGlass size={32} color="#2461f0" /></Button>
    </Stack>
  );
}

export default SearchBox;