"""
utils/fall.py
This file contains the FallDetectionModel class, which is used to detect falls.
It uses a GRU model to predict the probability of a fall.
"""

import numpy as np
import torch
import torch.nn as nn
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence


# GRU model for fall detection
class FallGRU(nn.Module):
    def __init__(self, input_size=24, hidden_size=128, num_layers=2, dropout=0.3):
        # initialize GRU model
        super(FallGRU, self).__init__()
        self.hidden_size = hidden_size
        self.bidirectional = True
        self.num_directions = 2 if self.bidirectional else 1

        # initialize GRU layer
        # this is simply a naming error, it is a GRU layer
        # the model was trained with this variable named as lstm and thus when loading the model it needs to be named as lstm too, but it is a GRU layer
        self.lstm = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
            bidirectional=self.bidirectional,
        )

        # initialize attention layer
        self.attn = nn.Linear(hidden_size * self.num_directions, 1)

        # initialize fully connected layer
        self.fc = nn.Linear(hidden_size * self.num_directions, 2)

    # forward pass
    def forward(self, x, lengths, return_attention=False):
        # pad video sequence to the same length
        packed = pack_padded_sequence(
            x, lengths.cpu(), batch_first=True, enforce_sorted=False
        )
        packed_out, _ = self.lstm(packed)
        output, _ = pad_packed_sequence(
            packed_out, batch_first=True, total_length=x.size(1)
        )

        # get attention scores
        raw_scores = self.attn(output).squeeze(-1)

        # build attention mask (1 for valid positions, 0 for padded)
        max_len = output.size(1)
        mask = torch.arange(max_len, device=lengths.device)[None, :] < lengths[:, None]

        # set attention scores for padded positions to -inf before softmax
        # ensures the padded positions have no attention
        raw_scores[~mask] = float("-inf")
        temperature = 2.0
        attn_weights = torch.softmax(raw_scores / temperature, dim=1).unsqueeze(-1)

        # compute context vector
        context = (output * attn_weights).sum(dim=1)

        # compute logits
        logits = self.fc(context)

        return logits


class FallDetectionModel:
    def __init__(self):
        # initialize model path
        self.model_path = r"models\fall_imbalanced_kp_attn_gru\best_model.pth"

        # initialize device
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # initialize window size
        self.window_size = 3

        # load the GRU model
        self.model = FallGRU()
        self.model = self.model.to(self.device)
        self.model.load_state_dict(
            torch.load(self.model_path, map_location=self.device)
        )
        self.model.eval()

        # initialize sequence buffer
        self.sequence = []

        # initialize minimum sequence length for prediction
        self.sequence_length = 120

        # initialize mode
        self.mode = "kp"

    # set the mode of the model
    def set_mode(self, mode: str):
        # set the type of model used based on the mode
        if mode == "diff":
            self.model_path = "models/fall_balanced_diffs_attn_gru/best_model.pth"
        elif mode == "kp":
            self.model_path = "models/fall_balanced_kp_attn_gru/best_model.pth"

    # add feature to the sequence buffer
    def add_feature(self, keypoints_diff: np.ndarray, keypoints_xy: np.ndarray):
        if self.mode == "diff":
            feature = keypoints_diff
        elif self.mode == "kp":
            feature = keypoints_xy
        else:
            raise ValueError(f"Invalid mode: {self.mode}")

        if feature is None or len(feature) != 24:
            return

        feature = np.asarray(feature, dtype=np.float32)

        if len(self.sequence) < self.sequence_length:
            self.sequence.append(feature)
        else:
            self.sequence.pop(0)
            self.sequence.append(feature)

    # smooth the sequence to reduce noise
    def smooth_sequence(self):
        smoothed = []
        for i in range(len(self.sequence)):
            start = max(0, i - self.window_size + 1)
            window = self.sequence[start : i + 1]
            avg = np.mean(window, axis=0)
            smoothed.append(avg)
        return smoothed

    # predict the sequence
    def predict_sequence(self):
        if len(self.sequence) < self.sequence_length:
            return None

        # apply smoothing to the sequence
        smoothed_sequence = self.smooth_sequence()
        smoothed_sequence_np = np.array(smoothed_sequence, dtype=np.float32)

        sequence_tensor = (
            torch.FloatTensor(smoothed_sequence_np).unsqueeze(0).to(self.device)
        )

        with torch.no_grad():
            lengths = torch.tensor([sequence_tensor.shape[1]]).to(self.device)
            outputs = self.model(sequence_tensor, lengths)
            probabilities = torch.softmax(outputs, dim=1)
            prediction = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][prediction].item()

        return {
            "is_fall": bool(prediction),
            "confidence": confidence,
            "fall_probability": probabilities[0][1].item(),
            "normal_probability": probabilities[0][0].item(),
        }

    # reset the sequence buffer
    def reset_sequence(self):
        self.sequence = []
