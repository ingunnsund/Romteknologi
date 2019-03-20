
//#define SERIAL_BAUD_R 19200
//#define SERIAL_BAUD_R 115200
#define SERIAL_BAUD_R 9600

bool isPaired = false; 
uint8_t isPaired_counter = 0; 

/*
void setup() {
   /*Init serial communication
   Serial.begin(SERIAL_BAUD_R); 
   Serial.setTimeout(5000);

}

int count = 0;
void loop() {

  Serial.print(count);
  delay(1000);
  count++;
  
}
*/


void setup() {
  Serial.begin(9600);  //initial the Serial
}

void loop() {
  if (Serial.available())  {
    Serial.write(Serial.read());//send what has been received
    Serial.println();   //print line feed character
  }
}
