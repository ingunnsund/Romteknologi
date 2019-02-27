
// main-modul for logikk etc.
// programmet kjøres herfra

uint8_t i = 0; 

void setup() { 
  // Start serial monitor at 9600 bps.
  Serial.begin(115200);
  
  //ble_setup();
  motor_setup();
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

   Serial.println(get_motor_rpm());

  // Kontrollere motor
  //motor_loop_step();


  // Kommunisere med mobilen
  //ble_check();

} 
