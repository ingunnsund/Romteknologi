
// main-modul for logikk etc.
// programmet kjøres herfra


void setup() { 
  // Start serial monitor at 9600 bps.
  Serial.begin(115200);
  
  //ble_setup();
  motor_setup();
  set_rpm_target(0); 
} 
 
void loop() { 
   /*set_motor_rpm(i);
   delay(200); 
   Serial.print("Target rpm: "); 
   Serial.print(i); 
   Serial.print("Measured rpm: "); 
   Serial.println(get_motor_rpm()); 
   i++; 
   delay(1000); */

    // Kontrollere motor
  //motor_loop_step();

  if (Serial.available())  {
    set_rpm_target(Serial.parseInt()); 
    delay(200);
  }

  motor_controller(); 


 
  //Serial.println(get_motor_rpm()); 


  // Kommunisere med mobilen
  //ble_check();

} 
