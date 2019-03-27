
#define MAX_G_TARGET 4

#define MILLIS_2_SEC 1000

volatile float target_g; 
float Ki_g = 0.000004 ; 
float Kp_g = 30; 
float Kd_g = 50; 
float err_acc_g; 
float prev_error = 0; 

unsigned long prev_time; 

void set_g_target(float target) {
  if(target > MAX_G_TARGET) {
    target_g = MAX_G_TARGET; 
  } else if(target <= 0) {
    err_acc_g = 0; 
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
     unsigned long curr_time = millis(); 
     unsigned long dt = (curr_time - prev_time)* MILLIS_2_SEC; 
     prev_time = curr_time; 
     float error = target_g - current_g; 
     err_acc_g += error*dt; 
     float derivative = (error - prev_error)/dt; 
     prev_error = error; 
     
     Serial.print(" Error: ");
     Serial.print(error); 
     Serial.print(" Err_acc: ");
     Serial.print(err_acc_g); 
     Serial.print(" Derivative: "); 
     Serial.print(derivative); 
     int target_rpm = (int)(Kp_g * (float) error + Ki_g * (float)err_acc_g + Kd_g * (float)derivative);  
     if(target_g > 0 && target_rpm < 27) {
      target_rpm = 27; 
      err_acc_g = 0; 
     }
     if (target_rpm < 0) {
        target_rpm = 0; 
     } else if (target_rpm > 255) {
        target_rpm = 255; 
     }
     //should there be some max or min here ?
     //when will err_acc be cleared?    
     Serial.print( "Target rpm: "); 
     Serial.println((uint8_t)target_rpm); 
     set_rpm_target((uint8_t)target_rpm); 

}
