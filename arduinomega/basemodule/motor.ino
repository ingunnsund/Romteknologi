#define IN_SPEED_PIN 2
#define DIRECTION_PIN 3
#define OUT_SPEED_PIN 4
#include <math.h>

int target_rpm = 0; 
uint8_t current_pwm = 255; 
bool motor_on = false; 

double coeff[5] = {-0.00000012738151467905, 0.00003770107584763563, -0.004487951180960165, 0.08480623145829404, 151.38464072531409};


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
    i += pulseIn(IN_SPEED_PIN, HIGH, 100000); 
    }
  i = i >> 3;
  return 111111/i; //RPM = (60*1000000/(45*6*2*i))
}

void set_motor_pwm(double pwm) {
   analogWrite(OUT_SPEED_PIN,pwm); 
} 

void set_rpm_target(uint8_t rpm) {
  if(rpm > 156) {
    rpm = 156; 
  }

  if(rpm < 27) {
    motor_on = false; 
    return; 
  }
  
  target_rpm = rpm; 
  motor_on = true; 
}

void motor_controller(void) {
  Serial.print("Target rpm: "); 
  Serial.print(target_rpm); 
  if(motor_on) {
    int current_rpm = get_motor_rpm(); 
    if(current_rpm < 0) {
      current_pwm = 233; 
      current_rpm = 27; 
    }
    Serial.print(" Current rpm: ");
    Serial.print(current_rpm); 
    if (current_rpm < target_rpm) {
        current_pwm--; 
    }else if(current_rpm > target_rpm) {
        current_pwm++; 
    }
  } else {
     current_pwm = 255; 
  }
  Serial.print(" Current pwm: ");
  Serial.println(current_pwm); 
  set_motor_pwm(current_pwm);
}

void motor_setup(void) {
  pinMode(DIRECTION_PIN, OUTPUT); //to choose direction
  pinMode(OUT_SPEED_PIN, OUTPUT); //to choose speed
  set_motordir_fw(); 
}
