


//Mega<->HM-10(topmodule) 
#define BAUD_RATE_SERIAL1 9600
//Mega<->HM-10(app)
#define BAUD_RATE_SERIAL2 9600

const int READ_TIME = 500; //ms

unsigned long prevMillis;

void bluetooth_init_top_comm(){
    Serial.println("BLE setup for top module start");
  
    // For HM-10 -> Top module interface
    Serial1.begin(BAUD_RATE_SERIAL1);
    
    // delay just in case bluetooth module needs time to "get ready".
    delay(1000);

    Serial1.write("AT+RESET");
    delay(700);

    // choose that state pin is LOW when not connected and HIGH when connected 
    Serial1.write("AT+PIO11");
    delay(700);
  
    // sets the module to Master mode.
    Serial1.write("AT+ROLE0");
    delay(700);
  
    // rename device
    Serial1.write("AT+NAMEMegaToTop");
    delay(700);
  
    Serial.println("BLE setup for top module complete");
}

void bluetooth_init_app_comm(){
    Serial.println("BLE setup for app start");
  
    //For HM-10 -> App interface
    Serial2.begin(BAUD_RATE_SERIAL2);
    
    // delay just in case bluetooth module needs time to "get ready".
    delay(1000);

    Serial2.write("AT+RESET");
    delay(700);

    // choose that state pin is LOW when not connected and HIGH when connected 
    Serial2.write("AT+PIO11");
    delay(700);
  
    // sets the module to Peripheral mode.
    Serial2.write("AT+ROLE0");
    delay(700);

    // rename device to
    Serial2.write("AT+NAMEMegaToApp");
    delay(700);
  
    Serial.println("BLE setup for app complete");
}

char c=' ';
boolean NL = true;

void bluetooth_loop_app(){
  // Read from the Bluetooth module and send to the Arduino Serial Monitor
    if (Serial2.available())
    {
        c = Serial2.read();
        Serial.write(c);
    }
 
 
    // Read from the Serial Monitor and send to the Bluetooth module
    if (Serial.available())
    {
        c = Serial.read();
 
        // do not send line end characters to the HM-10
        if (c!=10 & c!=13 ) 
        {  
             Serial2.write(c);
        }
 
        // Echo the user input to the main window. 
        // If there is a new line print the ">" character.
        if (NL) { Serial.print("\r\n>");  NL = false; }
        Serial.write(c);
        if (c==10) { NL = true; }
    }
}

void bluetooth_loop(){
  // Read from the Bluetooth module and send to the Arduino Serial Monitor
    if (Serial1.available())
    {
        c = Serial1.read();
        Serial2.write(c);
    }
 
 
    // Read from the Serial Monitor and send to the Bluetooth module
    if (Serial2.available())
    {
        c = Serial2.read();
        Serial1.write(c);
    }
}


char bluetooth_receive_top(){
  c = ' ';
  if (Serial1.available()){
        c = Serial1.read();
  }
  return c;
}

char bluetooth_receive_app(){
  c = ' ';
  if (Serial2.available()){
        c = Serial2.read();
  }
  return c;
}

void bluetooth_send_top(char *str){
  //Serial.print("Sending to top: ");
  //Serial.println(str);
  
  Serial1.write(str);
}

void bluetooth_send_app(char *str){
  //Serial.print("Sending to app: ");
  //Serial.println(str);
  
  Serial2.write(str);
}
