#include "Wire.h" 
#include <helper_3dmath.h>
#include <MPU6050.h>

#define ACCEL1_ADDR 0x70
#define ACCEL2_ADDR 0x74
#define ACCEL3_ADDR 0x77 

#define COUNTS_PER_G_2G 16384
#define COUNTS_PER_G_4G 8192
#define COUNTS_PER_G_8G 4096
#define COUNTS_PER_G_16G 2048

#define G_RANGE_2 0
#define G_RANGE_4 1
#define G_RANGE_8 2
#define G_RANGE_16 3

#include <I2Cdev.h>
#include <avr/sleep.h>
#include <avr/power.h>
MPU6050 accel1(ACCEL1_ADDR);  
MPU6050 accel2(ACCEL2_ADDR); 
MPU6050 accel3(ACCEL3_ADDR); 
int16_t ax1, ay1, az1;  // define accel as ax,ay,az
int16_t ax2, ay2, az2;  // define accel as ax,ay,az
int16_t ax3, ay3, az3;  // define accel as ax,ay,az
int16_t avg_x, avg_y, avg_z; 
int16_t gx, gy, gz;  // define gyro as gx,gy,gz

void setup() {
  Wire.begin();      // join I2C bus   
  //Serial.begin(115200);    //  initialize serial communication
  Serial.begin(38400);    //  initialize serial communication
  Serial.println("Initializing I2C devices...");
  accel1.initialize();  
  accel2.initialize(); 
  accel3.initialize(); 

  // verify connection
  Serial.println("Testing device connections...");
  Serial.println(accel1.testConnection() ? "Accel1 connection successful" : "Accel1 connection failed");
  Serial.println(accel2.testConnection() ? "Accel2 connection successful" : "Accel2 connection failed");
  Serial.println(accel3.testConnection() ? "Accel3 connection successful" : "Accel3 connection failed");


  //TODO: different g-ranges for each accelerometer
  accel1.setFullScaleAccelRange(G_RANGE_2);
  accel2.setFullScaleAccelRange(G_RANGE_2);
  accel3.setFullScaleAccelRange(G_RANGE_2);

  accel1.setStandbyXGyroEnabled(true);
  accel1.setStandbyYGyroEnabled(true);
  accel1.setStandbyZGyroEnabled(true);
  accel1.setStandbyYAccelEnabled(true);

  accel2.setStandbyXGyroEnabled(true);
  accel2.setStandbyYGyroEnabled(true);
  accel2.setStandbyZGyroEnabled(true);
  accel2.setStandbyYAccelEnabled(true);


  accel3.setStandbyXGyroEnabled(true);
  accel3.setStandbyYGyroEnabled(true);
  accel3.setStandbyZGyroEnabled(true);
  accel3.setStandbyYAccelEnabled(true);

 accel1.setSleepEnabled(true);
 accel2.setSleepEnabled(true);
 accel3.setSleepEnabled(true);
 
 

}

void printRaw(int16_t ax, int16_t ay, int16_t az) {
    Serial.print("a/g:\t");
    Serial.print(ax); 
    Serial.print("\t");
    Serial.print(ay); 
    Serial.print("\t");
    Serial.println(az); 
}

void printgforce(float ax, float ay, float az, float counts_per_g ) {
    ax = ax/counts_per_g; 
    ay = ay/counts_per_g; 
    az = az/counts_per_g; 
    
    Serial.print("g:\t");
    Serial.print(ax); 
    Serial.print("\t");
    Serial.print(ay); 
    Serial.print("\t");
    Serial.println(az); 
}

void update_average_accel(int16_t* ax, int16_t* ay, int16_t* az) {
     accel1.getAcceleration(&ax1, &ay1, &az1); 
     accel2.getAcceleration(&ax2, &ay2, &az2); 
     accel3.getAcceleration(&ax3, &ay3, &az3); 
     *ax = (ax1 + ax2 + ax3)/3; 
     *ay = (ay1 + ay2 + ay3)/3; 
     *az = (az1 + az2 + az3)/3; 
}

void enterSleep(void)
{
  //set_sleep_mode(SLEEP_MODE_IDLE);
  
  
  sleep_enable();


  /* Disable all of the unused peripherals. This will reduce power
   * consumption further and, more importantly, some of these
   * peripherals may generate interrupts that will wake our Arduino from
   * sleep!
   */
  power_adc_disable();
  power_spi_disable();
  power_timer0_disable();
  power_timer2_disable();
  power_twi_disable();  

  /* Now enter sleep mode. */
  sleep_mode();
  
  /* The program will continue from here after the timer timeout*/
  sleep_disable(); /* First thing to do is disable sleep. */
  
  /* Re-enable the peripherals. */
  power_all_enable();
}

 

void loop() {

  delay(100);

  accel1.setSleepEnabled(false); 

  /*if(Serial.available()) {
    Serial.write(Serial.read()); 
  }*/
 
  accel1.getAcceleration(&ax1, &ay1, &az1); 
  printgforce((float)ax1,(float)ay1,(float)az1, COUNTS_PER_G_2G); 
  
  
   //printRaw(ax1, ay1, az1); 
}
