#define IN_SPEED_PIN 2
#define DIRECTION_PIN 3
#define OUT_SPEED_PIN 4
#include <math.h>

#define TO_SCALE_PWM 238 
#define TO_SCALE_DELAY 10


int target_rpm = 0; 
int current_pwm = 255; 
bool motor_on = false; 
float Ki = 0.01; 
float Kp = 0.0005; 
int err_acc = 0; 




/* to scale for 1 g is 10 rpm which is too low for the encoder to read out -> 
the motor controller won't work at this speed. This function decends to that speed manually */ 
void rotate_to_scale(void) {
     if(current_pwm >= TO_SCALE_PWM) {
        set_motor_pwm(TO_SCALE_PWM);
     } else {
        for(int pwm = current_pwm+1; pwm <= TO_SCALE_PWM; pwm++) { 
            set_motor_pwm(pwm); 
            delay(TO_SCALE_DELAY); 
        }
     }
}



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

void set_motor_pwm(uint8_t pwm) {
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
      current_rpm = 0; 
    }
    if(current_rpm > 255) {
      current_rpm = 255; 
    }
    Serial.print(" Current rpm: ");
    Serial.print(current_rpm); 
    int error = target_rpm - current_rpm; 
    err_acc += error; 

    Serial.print(" Error: ");
    Serial.print(error); 
    Serial.print(" Err_acc: ");
    Serial.print(err_acc); 
    current_pwm = 255 - (int)(Kp * (float) error + Ki * (float)err_acc); 
    if(current_pwm < 0) {
      current_pwm = 0; 
    } else if (current_pwm > 230) {
      current_pwm = 230; 
    }
  } else {
     current_pwm = 255; 
     err_acc = 0; 
  }
  Serial.print(" Current pwm: ");
  Serial.println(current_pwm); 
  set_motor_pwm((uint8_t)current_pwm);
}

void motor_setup(void) {
  pinMode(DIRECTION_PIN, OUTPUT); //to choose direction
  pinMode(OUT_SPEED_PIN, OUTPUT); //to choose speed
  set_motordir_fw(); 
  set_rpm_target(0); 
}
