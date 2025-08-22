### Drowsiness Detector ###

A real-time drowsiness detection system that monitors head position and alerts the user when drowsy. Built using **PyTorch** and **YOLO** for computer vision, with an optional Arduino buzzer for hardware alerts.

## Features
- Detects if the user’s head is tilted down (drowsy) or upright (awake)
- Triggers a visual and/or audio alert in real-time
- Can integrate with an Arduino buzzer for external alerts

## Installation
1. Clone this repository:
   git clone https://github.com/your-username/drowsiness-detector.git
2. Install the required packages.
3. Run the python file.
4. Watch the webcam feed to see the drowsiness detection in action

   If using Arduino, make sure it’s connected to the correct port.

5. Hardware Integration : 
   Connect an Arduino with a buzzer

  The system sends a signal to the Arduino when drowsiness is detected.
