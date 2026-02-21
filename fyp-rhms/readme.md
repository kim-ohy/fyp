# Remote Health Monitoring System (RHMS)

This project is a Remote Health Monitoring System (RHMS) designed to detect falls and monitor respiratory rate (RR) using depth camera data and machine learning models. The system processes real-time video streams, detects falls, estimates respiratory rate, and logs alerts to a Supabase database for further action and notification.

## Features

- **Fall Detection:**  
  Uses a deep learning model to detect falls from depth camera data and saves video clips of detected falls.

- **Respiratory Rate Monitoring:**  
  Continuously estimates the respiratory rate of detected persons using pose estimation and depth data.

- **Alert System:**  
  - Automatically uploads fall video clips and logs fall events to a Supabase database.
  - Logs unusual respiratory rates as alerts in the database.
  - Sends notifications for both fall and RR alerts.

- **Camera Status Monitoring:**  
  Updates and notifies the system about the camera's operational status.

## Project Structure

```
.
├── main.py                  # Main entry point for running the system
├── utils/
│   ├── camera.py            # Camera interface and preprocessing
│   ├── pose.py              # Pose estimation model and utilities
│   ├── fall.py              # Fall detection model and logic
│   ├── rr.py                # Respiratory rate monitoring logic
│   └── database.py          # Supabase database integration
├── models/                  # Pretrained model weights and training artifacts
├── clips/                   # Saved fall video clips
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/fyp-rhms.git
cd fyp-rhms
```

### 2. Install dependencies

It is recommended to use a virtual environment (e.g., Anaconda or venv).

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Download the `.env` file from the shared onedrive link.

### 4. Prepare Models

Ensure the required model weights are present in the `models/` directory as per the structure.

### 5. Connect and Set Up the Depth Camera

Make sure the depth camera (Microsoft Kinect v1 sensor) is connected and the necessary drivers are installed.

## Usage

Run the main system:

```bash
python main.py
```

- The system will start processing the camera feed.
- Fall events and unusual respiratory rates will be logged and notified via Supabase.
- Press `q` in the display window to quit.

## Customization

- **Model Selection:**  
  You can switch between different fall detection models or modes by modifying the relevant lines in `main.py` and `utils/fall.py`.

- **Alert Thresholds:**  
  Adjust the thresholds for respiratory rate alerts in `main.py` as needed.

## Dependencies

All required Python packages are listed in `requirements.txt`. Major dependencies include:
- OpenCV
- NumPy
- PyTorch
- Supabase Python client
- dotenv
- matplotlib
- scikit-learn

## Notes

- This system is intended for research and prototyping. For deployment, further testing and optimization may be required.
- Ensure your Supabase database schema matches the expected structure for alerts and video uploads.

