
// Eksempelkode for å koble til HM-10 modul til Arduino Mega
// for å kommunisere med mobilen

/*
ArduinoBlue example code to demonstrate the features of the app.
Instruction:
1. Check BLUETOOTH_TX and BLUETOOTH_RX pins
2. The modules can be paired using the default pin 000000.
*/

#include <SoftwareSerial.h>

// The bluetooth tx and rx pins must be supported by software serial.
// Visit https://www.arduino.cc/en/Reference/SoftwareSerial for unsupported pins.
// Bluetooth TX -> Arduino D8
const int BLUETOOTH_TX = 8;
// Bluetooth RX -> Arduino D7
const int BLUETOOTH_RX = 7;

const int READ_TIME = 500; //ms

unsigned long prevMillis;

SoftwareSerial bluetooth(BLUETOOTH_TX, BLUETOOTH_RX);

// Setup for this module
void ble_setup() {
    // Start serial monitor at 9600 bps.
    Serial.begin(9600);
    
    // Start bluetooth serial at 9600 bps.
    bluetooth.begin(9600);
    
    // delay just in case bluetooth module needs time to "get ready".
    delay(1000);

    // rename device to xxxxxx
    bluetooth.write("AT+NAMEArduinoMEGA");
    
    Serial.println("BLE setup complete");
}

void ble_check() {
  if (Serial.available()) {
    String str = "";
    Serial.print("Input: ");
    
    prevMillis = millis();
    while (millis() - prevMillis < READ_TIME) {
      if (Serial.available()) {
        char c = Serial.read();
        if (c != 10 && c != 13) { // Don't send line end characters to HM10.
          str += c;
        }
      }
    }
    
    bluetooth.print(str);
    Serial.println(str);
  }

  if (bluetooth.available()) {
    String str = "";
    Serial.print("HM10: ");
    
    prevMillis = millis();
    while (millis() - prevMillis < READ_TIME) {
      if (bluetooth.available()) {
        str += (char) bluetooth.read();
      }
    }
    Serial.println(str);
  }
}
