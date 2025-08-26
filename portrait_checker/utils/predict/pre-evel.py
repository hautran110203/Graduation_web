import pandas as pd
import numpy as np
from sklearn.metrics import (precision_recall_fscore_support,
                             hamming_loss, accuracy_score)

LABELS = ["is_fake","no_face","multi_face","off_center","occluded",
          "blurry","too_dark","too_bright","bad_pose","bad_bg"]

gt = pd.read_csv("gt_eval.csv")
pr = pd.read_csv("pred_eval.csv")
y_true = gt[LABELS].values.astype(int)
y_pred = pr[LABELS].values.astype(int)

# per-label P/R/F1 (macro = trung bình không trọng số)
prec, rec, f1, sup = precision_recall_fscore_support(
    y_true, y_pred, average=None, zero_division=0
)
macro = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
micro = precision_recall_fscore_support(y_true, y_pred, average="micro", zero_division=0)

print("Per-label F1:", dict(zip(LABELS, f1.round(4))))
print("Macro P/R/F1:", tuple(round(x,4) for x in macro[:3]))
print("Micro P/R/F1:", tuple(round(x,4) for x in micro[:3]))
print("Hamming loss:", round(hamming_loss(y_true, y_pred), 4))
print("Subset accuracy (exact match):", round(accuracy_score(y_true, y_pred), 4))
