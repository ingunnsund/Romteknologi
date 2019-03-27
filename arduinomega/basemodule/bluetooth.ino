
volatile bool app_connected = false;
volatile bool top_connected = false; 

volatile float top_current_g = 0;
volatile float app_target_g = 0;

//Mega<->HM-10(topmodule) 
#define BAUD_RATE_SERIAL1 9600
//Mega<->HM-10(app)
#define BAUD_RATE_SERIAL2 9600

const int READ_TIME = 500; //ms

unsigned long prevMillis;
char c=' ';

#define STATUS_TOP_PIN 5
#define STATUS_TOP_LED 6

#define STATUS_APP_PIN 7
#define STATUS_APP_LED 8

// ================================ //


/*you have to enable delay of 700 in order for the setup to actually happen, 
 * but since the setup har run before, the setup is not neccesary every start-up
 */

void wait_for_at_ok(){
  //delay(700);
   delay(10); 
}

void bluetooth_init_top_comm(void){
    Serial.println("BLE setup for top module start");
  
    // For HM-10 -> Top module interface
    Serial1.begin(BAUD_RATE_SERIAL1);
    
    // delay just in case bluetooth module needs time to "get ready".
    wait_for_at_ok();

    // Wait for connection command before starting
    Serial1.print("AT+IMME1" );
    wait_for_at_ok();
    
    // sets the module to Master mode.
    Serial1.print("AT+ROLE1");
    wait_for_at_ok();

    Serial1.print("AT+RESET");
    wait_for_at_ok();
        
    // Connect to Beetle (mac: 0C:B2:B7:46:86:47)
    Serial1.print("AT+CON0CB2B7468647");
    wait_for_at_ok();
  
    // choose that state pin is LOW when not connected and HIGH when connected 
    Serial1.print("AT+PIO11");
    wait_for_at_ok();

    // rename device
    Serial1.print("AT+NAMEMegaToTop");
    wait_for_at_ok();

    Serial1.print("AT+START");
    wait_for_at_ok();
  
    Serial.println("BLE setup for top module complete");
}

void bluetooth_init_app_comm(void){
    Serial.println("BLE setup for app start");
  
    //For HM-10 -> App interface
    Serial2.begin(BAUD_RATE_SERIAL2);
    
    // delay just in case bluetooth module needs time to "get ready".
    wait_for_at_ok();

    Serial2.print("AT+RESET");
    wait_for_at_ok();

    // choose that state pin is LOW when not connected and HIGH when connected 
    Serial2.print("AT+PIO11");
    wait_for_at_ok();
  
    // sets the module to Peripheral mode.
    Serial2.print("AT+ROLE0");
    wait_for_at_ok();

    // rename device to
    Serial2.print("AT+NAMESpaceBungalo");
    wait_for_at_ok();
  
    Serial.println("BLE setup for app complete");
}

void send_to_app(float g){
  /*char value[6];
  dtostrf(g, 4, 2, value);
  Serial2.write(value);
  */ 
  Serial2.println(g); 
}

float receive_from_top(void){
  float val = top_current_g;
  if (Serial1.available()){
        val = Serial1.parseFloat();
  }
  return val;
}

float receive_from_app(void){
  float val = app_target_g;
  if (Serial2.available()){
        val = Serial2.parseFloat();
  }
  return val;
}

void reconnect(void){
  Serial1.print("AT+CONNL");
  delay(50);
}

bool check_connection_top(void){
  if (not top_connected and digitalRead(STATUS_TOP_PIN) == 1){
    digitalWrite(STATUS_TOP_LED, HIGH);
    top_connected = true;
  }
  if (top_connected and digitalRead(STATUS_TOP_PIN) == 0){
    digitalWrite(STATUS_TOP_LED, LOW);
    top_connected = false;
  }
  return top_connected;
}

bool check_connection_app(void){
  if (not app_connected and digitalRead(STATUS_APP_PIN) == 1){
    digitalWrite(STATUS_APP_LED, HIGH);
    app_connected = true;
  }
  if (top_connected and digitalRead(STATUS_APP_PIN) == 0){
    digitalWrite(STATUS_APP_LED, LOW);
    app_connected = false;
  }
  return app_connected;
}

boolean NL = true;
void bluetooth_loop_app(void){
  // Read from the Bluetooth module and send to the Arduino Serial Monitor
    if (Serial2.available()){
        c = Serial2.read();
        Serial.write(c);
    }
 
    // Read from the Serial Monitor and send to the Bluetooth module
    if (Serial.available()){
        c = Serial.read();
 
        // do not send line end characters to the HM-10
        if (c!=10 & c!=13 ){  
             Serial2.write(c);
        }
 
        // Echo the user input to the main window. 
        // If there is a new line print the ">" character.
        if (NL) { Serial.print("\r\n>");  NL = false; }
        Serial.write(c);
        if (c==10) { NL = true; }
    }
}

void bluetooth_loop_top(void){
  // Read from the Bluetooth module and send to the Arduino Serial Monitor
    if (Serial1.available()){
        c = Serial1.read();
        //top_current_g = Serial1.parseFloat();
        Serial.write(c);
    }
 
 
    // Read from the Serial Monitor and send to the Bluetooth module
    if (Serial.available()){
        c = Serial.read();
 
        // do not send line end characters to the HM-10
        if (c!=10 & c!=13 ){  
             Serial1.write(c);
        }
 
        // Echo the user input to the main window. 
        // If there is a new line print the ">" character.
        if (NL) { Serial.print("\r\n>");  NL = false; }
        Serial.write(c);
        if (c==10) { NL = true; }
    }
}

// ===== Public funksjoner ====== //

// Denne blir kalt ved setup
void bt_init(void){
  
  pinMode(STATUS_TOP_PIN, INPUT);
  pinMode(STATUS_TOP_LED, OUTPUT);

  pinMode(STATUS_APP_PIN, INPUT);
  pinMode(STATUS_APP_LED, OUTPUT);

  digitalWrite(STATUS_TOP_LED, LOW);
  digitalWrite(STATUS_APP_LED, LOW);
  
  bluetooth_init_top_comm();
  bluetooth_init_app_comm();
}

// Denne blir kalt regelmessig i loop
void bt_controller(void){

  //bluetooth_loop_app();
  //bluetooth_loop_top();


  top_connected = check_connection_top();
  app_connected = check_connection_app();

  if (top_connected){
    top_current_g = receive_from_top(); 
    if (app_connected){
      send_to_app(top_current_g);
    }
  }
  else {
    reconnect();
  }

  if (app_connected){
    app_target_g = receive_from_app();
  }
}

bool bt_is_app_connected(void){
  return app_connected;
}

bool bt_is_top_connected(void){
  return top_connected;
}

float bt_get_top_current_g(void){
  return top_current_g;
}

float bt_get_app_target_g(void){
  return app_target_g;
}
