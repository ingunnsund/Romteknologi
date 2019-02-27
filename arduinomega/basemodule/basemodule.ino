
// main-modul for logikk etc.
// programmet kjøres herfra

void setup() { 
  // Start serial monitor at 9600 bps.
  Serial.begin(9600);
  
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
