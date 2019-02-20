
// main-modul for logikk etc.

void setup() { 
  ble_setup();
  motor_setup();
} 
   
void loop() { 
  // put your main code here, to run repeatedly: 


  // Kontrollere motor
  motor_loop_step();


  // Kommunisere med mobilen
  ble_check();

  
} 
