#define IN_SPEED_PIN 2
#define DIRECTION_PIN 3
#define OUT_SPEED_PIN 4
#include <math.h>

double coeff[5] = {0.00000013, 0.0000377, -0.00448795, 0.0848062, 151.38464073};
void set_motordir_fw(void) {
  digitalWrite(DIRECTION_PIN, HIGH); 
}

void set_motordir_bw(void) {
  digitalWrite(DIRECTION_PIN, LOW); 
}

int get_motor_rpm(void){
    int i = 0; 
    for(int j = 0;j<8;j++)  {
    /* SIGNAL OUTPUT PIN 9 with  white line,cycle = 2*i,1s = 1000000us，Signal cycle pulse number：27*2 */
    i += pulseIn(IN_SPEED_PIN, HIGH, 500000); 
    }
  i = i >> 3;
  return 111111/i; //RPM = (60*1000000/(45*6*2*i))
}

void set_motor_rpm(double rpm) {
   uint8_t pwm = (uint8_t) pow(rpm, 4)*coeff[0] + pow(rpm, 3)*coeff[1] + pow(rpm, 2)*coeff[2] + rpm*coeff[3] + coeff[4]; 
   Serial.println(pwm); 
   analogWrite(OUT_SPEED_PIN,pwm); 
} 

void motor_setup(void) {
  pinMode(DIRECTION_PIN, OUTPUT); //to choose direction
  pinMode(OUT_SPEED_PIN, OUTPUT); //to choose speed
  set_motordir_fw(); 
  set_motor_rpm(100); 
}
