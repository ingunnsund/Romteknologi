/* This code is used with an arduino Mega that controls the basemodule of the "Space Bungalow" model.
 * The code controls a motor that rotates the top module with a simple PI-controller that reads the current 
 * rpm of the motor from an encoder and a target rpm from another PI-controller that controls the
 * the radial g-force in the top module. The g-force controller receives current avarage g-force from an 
 * Arduino Beetle BLE through a HM-10 bluetooth Module. The target is set by an Android app over bluetooth BLE 
 * to another HM-10. The code also reports the current g-force in the top module to the Android app. 
 * 
 * The code supports two modes, triggered by an interrupt on a switch: 
 * bluetooth mode or manual mode where the code turns on the motor to a predefined g-force. 
 * When in manual mode, the RGB LED will be RED. 
 * Bluetooth mode is separeted into another two modes, set by the android app: 
 * to scale mode or measured g mode. 
 * In to scale mode, the motor rotates at the RPM that a full scale (50:1) Space Bungalow 
 * would rotate with in order to produce 1 g of artifical gravity. 
 * Measured g mode is the normal operation where the target g-force can be set by the app and will 
 * be handlesd by the Pi-controllers. 
 * In bluetooth mode, the rgb will be WHITE if it has no bluetooth connection, 
 * GREEN if it is connected to the top module (but not the app) and BLUE if it is connected to the app. 
 */


//Mega<->Serial Monitor 
#define BAUD_RATE_SERIAL0 9600 // 115200

#define SWITCH_PIN 20 //?? grønn, (gul til jord)

//TODO: remove and replace with accel 1 g 
#define MANUAL_MODE_1G 69

volatile bool manual_mode; 
volatile bool to_scale_mode = false;  

void setup(){ 

  motor_setup();

  rgb_led_setup(); 
  
  //Mega<->Serial Monitor 
  Serial.begin(BAUD_RATE_SERIAL0); 

  //delay(1000); 

  bt_init();
 
  //switch setup
   pinMode(SWITCH_PIN, INPUT_PULLUP); 
   attachInterrupt(digitalPinToInterrupt(SWITCH_PIN), handle_switch_event, CHANGE);
   handle_switch_event(); 
  
   Serial.println("Setup complete");

} 


void loop(){ 


  //send current g_force to app here

  bt_controller(); 

  if(manual_mode) {
     if(bt_is_top_connected()) {
        set_g_target(1);  
     } else {
        set_rpm_target(MANUAL_MODE_1G); 
     }
  } else {
      if(bt_is_app_connected()) {
         set_BLUE_LED(); 
         float target = bt_get_app_target_g();
         if(target < 0) {
            to_scale_mode = true; 
            rotate_to_scale(); 
         } else {
            to_scale_mode = false; 
            set_g_target(target); 
         }
      } else if(bt_is_top_connected()) {
        set_GREEN_LED(); 
        set_g_target(0); 
      } else {
        set_WHITE_LED(); 
        set_g_target(0);
      }
  }
  
  if(!to_scale_mode) {
    if(bt_is_top_connected()) {
        g_force_controller(); 
    }
    motor_controller(); 
  }
}

void handle_switch_event(void) {
  if(digitalRead(SWITCH_PIN) == LOW) {
     manual_mode = true; 
     set_RED_LED(); 
  } else {
     manual_mode = false; 
     to_scale_mode = false; 
     if(bt_is_app_connected()) {
        set_BLUE_LED(); 
     } else if(bt_is_top_connected()) {
        set_GREEN_LED(); 
     } else {
        set_WHITE_LED(); 
     }
     set_g_target(0); 
  }
}
