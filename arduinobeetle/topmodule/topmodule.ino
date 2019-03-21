
#include <MPU6050.h>

#include <DFRobot_I2CMultiplexer.h>
#include "Wire.h" 

#include <LowPower.h>
#include <avr/sleep.h>
#include <avr/power.h>

/* Static I2C adress of the MPU5060 (accel-chip) */
#define ACCEL_ADDR 0x69 

/*
 * One of the 8 possible (0x70-0x77) I2C addresses of the I2C multiplexer, can be changed with switches on the board.
 * The ports that the accelerometer sensor are attached to on the I2C multiplexer (possible: 0-7).
 */
#define I2C_MUX_ADDR 0x70 
#define ACCEL1_PORT 0
#define ACCEL2_PORT 4
#define ACCEL3_PORT 7

<<<<<<< HEAD
/* Baud rate of the bluetooth chip, can be changed with "AT commands". */
#define SERIAL_BAUD_R 115200
=======
//#define SERIAL_BAUD_R 19200
//#define SERIAL_BAUD_R 115200
#define SERIAL_BAUD_R 9600
>>>>>>> a88c35dc0cad01b813b29656d45076ce4cb4aa09

/* Used to set the +/- range of the g-force that the accelerometers will measure */ 
#define G_RANGE_2 0
#define G_RANGE_4 1
#define G_RANGE_8 2
#define G_RANGE_16 3
#define G_RANGE G_RANGE_4

/* Used to convert the raw data into g-force, should be set based upon G_RANGE */ 
#define COUNTS_PER_G_2G 16384
#define COUNTS_PER_G_4G 8192
#define COUNTS_PER_G_8G 4096
#define COUNTS_PER_G_16G 2048
#define COUNTS_PER_G COUNTS_PER_G_4G

/* Used to set the frequency at which the MPU6050 (accel-chip) wakes up and do a measurement */ 
#define WAKE_FREQ_40HZ 3

/*Calibration constants calculated at startup*/ 
int32_t z1_cal, z2_cal, z3_cal; 

/*Create acceleration sensor object*/
MPU6050 accel;  

/* 
 *  Since the acceleration sensors have the same fixed I2C adress, 
 *  a I2C multiplexer is used. By only declaring one accel object, 
 *  and then changing port with the I2CMultiplexer object, we 
 *  can select the different sensors and use the methods for the 
 *  single accel object to read data and do setup. 
 */

/*Create an I2C Multiplexer object */
DFRobot_I2CMultiplexer I2CMulti(I2C_MUX_ADDR);


void init_accel(int ACCEL_PORT) { 
 
   I2CMulti.selectPort(ACCEL_PORT);
   
   accel.initialize();  
   
   accel.setFullScaleAccelRange(G_RANGE);

   /*disable all DOF + temp sensor except Z-axis accel*/ 
   accel.setStandbyXGyroEnabled(true);
   accel.setStandbyYGyroEnabled(true);
   accel.setStandbyZGyroEnabled(true);
   accel.setStandbyYAccelEnabled(true);
   accel.setStandbyXAccelEnabled(true); 
   accel.setTempSensorEnabled(false);
   
   /*
    * Disable that the MPU6050 sleeps and wakes up with a given frequency to measure acceleration, 
    * so that we can do a quick calibration, 
    * after calibration it will be enabled again. 
    */
   accel.setWakeCycleEnabled(false);
}


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


void enable_wake_up_cycle(int ACCEL_PORT) {
   I2CMulti.selectPort(ACCEL_PORT);
   accel.setWakeFrequency(WAKE_FREQ_40HZ);
   delay(5); 
   accel.setWakeCycleEnabled(true);
}


void setup() {
   Serial.begin(SERIAL_BAUD_R); 
   init_accel(ACCEL1_PORT); 
   init_accel(ACCEL2_PORT); 
   init_accel(ACCEL3_PORT); 

   calibrate_accels(); 

   /* Set all MPU5060s to sleep with a wake-up frequency of 40Hz or 10Hz, 
    * documentation unclear...
    * Each wakeup the MPU5060 does a accel measurement and goes back to sleep
    */
   enable_wake_up_cycle(ACCEL1_PORT); 
   enable_wake_up_cycle(ACCEL2_PORT);
   enable_wake_up_cycle(ACCEL3_PORT);
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
  /*Send average g-force via UART to the bluetooth chip, which will transmit if it is paired */ 
  Serial.println(get_avg_gforce());
  
  /*Wait untill all data have been sent before going to sleep*/ 
  Serial.flush();
  
  /*Do a complete powerdown and sleep for 120 ms, turn off the ADC and brown out detection*/
  LowPower.powerDown(SLEEP_120MS, ADC_OFF, BOD_OFF);  
}
