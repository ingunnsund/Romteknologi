
#define MAX_G_TARGET 4

volatile float target_g; 
float Ki_g = 0.5 ; 
float Kp_g = 3; 
float err_acc_g; 

void set_g_target(float target) {
  if(target > MAX_G_TARGET) {
    target_g = MAX_G_TARGET; 
  } else if(target < 0) {
    target_g = 0; 
  } else {
    target_g = target; 
  }
  
}


void g_force_controller(void) {
     Serial.print("Target g: "); 
     Serial.print(target_g); 
     float current_g = bt_get_top_current_g();
     Serial.print(" current g: "); 
     Serial.print(current_g);
     float error = target_g - current_g; 
     err_acc_g += error; 
     Serial.print(" Error: ");
     Serial.print(error); 
     Serial.print(" Err_acc: ");
     Serial.print(err_acc_g); 
     int target_rpm = 20 + (int)(Kp_g * (float) error + Ki_g * (float)err_acc_g);  //should there be a minus somewhere? 
     //should there be some max or min here ?
     //when will err_acc be cleared?    
     Serial.print( "Target rpm: "); 
     Serial.println(target_rpm); 
     set_rpm_target(target_rpm); 

}
