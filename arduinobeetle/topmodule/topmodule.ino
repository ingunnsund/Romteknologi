#include <LowPower.h>

#include <DFRobot_I2CMultiplexer.h>
#include "Wire.h" 

#include <helper_3dmath.h>
#include <MPU6050.h>

#include <avr/sleep.h>
#include <avr/power.h>

#define ACCEL_ADDR 0x69 
#define I2C_MUX_ADDR 0x70 
#define ACCEL1_PORT 0
#define ACCEL2_PORT 4
#define ACCEL3_PORT 7

#define SERIAL_BAUD_R 19200

#define G_RANGE_2 0
#define G_RANGE_4 1
#define G_RANGE_8 2
#define G_RANGE_16 3
#define G_RANGE G_RANGE_2

#define COUNTS_PER_G_2G 16384
#define COUNTS_PER_G_4G 8192
#define COUNTS_PER_G_8G 4096
#define COUNTS_PER_G_16G 2048

#define COUNTS_PER_G COUNTS_PER_G_2G



int16_t ax1, ay1, az1;  // define accel as ax,ay,az
int16_t ax2, ay2, az2;  // define accel as ax,ay,az
int16_t ax3, ay3, az3;  // define accel as ax,ay,az
int16_t avg_x, avg_y, avg_z; 

int32_t z1_cal, z2_cal, z3_cal; 

bool isPaired = false; 
uint8_t isPaired_counter = 0; 


/*Create acceleration sensor object*/
MPU6050 accel;  

/*Create an I2C Multiplexer object*/ 
DFRobot_I2CMultiplexer I2CMulti(I2C_MUX_ADDR);



void calibrate_accels(void) {
  I2CMulti.selectPort(ACCEL1_PORT);
  for(int i = 0; i < 100; i++) {
  z1_cal += accel.getAccelerationZ();
  } 
  z1_cal /= 100; 
   
  I2CMulti.selectPort(ACCEL2_PORT);
  for(int i = 0; i < 100; i++) {
  z2_cal += accel.getAccelerationZ(); 
  } 
  z2_cal /= 100; 
  
  I2CMulti.selectPort(ACCEL3_PORT);
  for(int i = 0; i < 100; i++) {
  z3_cal += accel.getAccelerationZ(); 
  }
  z3_cal /= 100;   
}

void init_accel(void) { 
  
   /* Select accel1 */ 
   Serial.println("Initializing I2C devices...");
   I2CMulti.selectPort(ACCEL1_PORT);
   accel.initialize();  
   accel.setFullScaleAccelRange(G_RANGE);
   accel.setStandbyXGyroEnabled(true);
   accel.setStandbyYGyroEnabled(true);
   accel.setStandbyZGyroEnabled(true);
   accel.setStandbyYAccelEnabled(true);
   accel.setStandbyXAccelEnabled(true); 
   
   I2CMulti.selectPort(ACCEL2_PORT);
   accel.initialize();
   accel.setFullScaleAccelRange(G_RANGE);
   accel.setStandbyXGyroEnabled(true);
   accel.setStandbyYGyroEnabled(true);
   accel.setStandbyZGyroEnabled(true);
   accel.setStandbyYAccelEnabled(true);
   accel.setStandbyXAccelEnabled(true); 

   I2CMulti.selectPort(ACCEL3_PORT);
   accel.initialize();
   accel.setFullScaleAccelRange(G_RANGE);
   accel.setStandbyXGyroEnabled(true);
   accel.setStandbyYGyroEnabled(true);
   accel.setStandbyZGyroEnabled(true);
   accel.setStandbyYAccelEnabled(true);
   accel.setStandbyXAccelEnabled(true); 
   
  
   Serial.println("Testing device connections...");
   I2CMulti.selectPort(ACCEL1_PORT);
   Serial.println(accel.testConnection() ? "Accel1 connection successful" : "Accel1 connection failed");

   I2CMulti.selectPort(ACCEL2_PORT);
   Serial.println(accel.testConnection() ? "Accel2 connection successful" : "Accel2 connection failed");

   I2CMulti.selectPort(ACCEL3_PORT);
   Serial.println(accel.testConnection() ? "Accel3 connection successful" : "Accel3 connection failed");
    
   
   Serial.println("Calibrating accelerometers..."); 
   calibrate_accels(); 
   Serial.println("Calibration finished"); 
   Serial.flush();
}

void setup() {
   /*Init serial communication*/ 
   Serial.begin(SERIAL_BAUD_R); 
   Serial.setTimeout(5000);

   init_accel(); 

   //sleep_setup(); 
}

void printRawAccel(int16_t ax, int16_t ay, int16_t az, int port) {
    Serial.print("a/g:\t");
    Serial.print(ax); 
    Serial.print("\t");
    Serial.print(ay); 
    Serial.print("\t");
    Serial.println(az); 
}

void printgforce(float ax, float ay, float az, int port) {
    ax = ax/COUNTS_PER_G; 
    ay = ay/COUNTS_PER_G; 
    az = az/COUNTS_PER_G; 

    Serial.print("Accel");
    Serial.print(port);
    Serial.print(" g:\t");
    Serial.print(ax); 
    Serial.print("\t");
    Serial.print(ay); 
    Serial.print("\t");
    Serial.println(az); 
}

float get_avg_gforce(void) {
  float avg_az = 0; 
  I2CMulti.selectPort(ACCEL1_PORT);
  avg_az += accel.getAccelerationZ() - z1_cal; 
  I2CMulti.selectPort(ACCEL2_PORT);
  avg_az += accel.getAccelerationZ() - z2_cal; 
  I2CMulti.selectPort(ACCEL3_PORT);
  avg_az += accel.getAccelerationZ() - z3_cal; 
 
  avg_az /= 3; 
  
  return avg_az/COUNTS_PER_G; 
} 




void loop() {

  /*
  I2CMulti.selectPort(ACCEL1_PORT);
  accel.getAcceleration(&ax1, &ay1, &az1); 
  //printgforce((float)ax1,(float)ay1,(float)az1, COUNTS_PER_G_2G, ACCEL1_PORT); 

  I2CMulti.selectPort(ACCEL2_PORT);
  accel.getAcceleration(&ax2, &ay2, &az2); 
  //printgforce((float)ax2,(float)ay2,(float)az2, COUNTS_PER_G_2G, ACCEL2_PORT); 
  //printRawAccel(ax2, ay2, az2, ACCEL3_PORT);
  
  I2CMulti.selectPort(ACCEL3_PORT);
  accel.getAcceleration(&ax3, &ay3, &az3); 
  //accel.setSleepEnabled(true);
  printgforce((float)ax3,(float)ay3,(float)az3, COUNTS_PER_G_2G, ACCEL3_PORT); 
  //printRawAccel(ax3, ay3, az3, ACCEL3_PORT); 
  */ 

/*

  if(!isPaired_counter) {
    Serial.println("ACK_REQ");  
    uint8_t buf[8]; 
    if(Serial.readBytes(buf, 8)) {
      isPaired = true; 
    } else {
      isPaired = false; 
    }
    Serial.println("ACK over"); 
  }

  isPaired_counter++; 
  isPaired_counter %= 10; 

  if(isPaired) {
      Serial.print("g:\t");
      Serial.println(get_avg_gforce());  
  }

  */
  Serial.print("g:\t");
  Serial.println(get_avg_gforce());  
  delay(50); 
  
  
  Serial.flush();
  LowPower.powerDown(SLEEP_120MS, ADC_OFF, BOD_OFF); 
  
}
