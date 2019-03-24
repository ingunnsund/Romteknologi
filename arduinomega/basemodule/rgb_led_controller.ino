#define LED_RED_PIN 13
#define LED_GREEN_PIN 12 
#define LED_BLUE_PIN 11


void rgb_led_setup(void) {
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_BLUE_PIN, OUTPUT);  
}

struct color_t {
    uint8_t r;
    uint8_t g;
    uint8_t b;
};

const struct color_t RED = {255, 0, 0};
const struct color_t GREEN = {0,255,0};
const struct color_t BLUE = {0,0,255}; 
const struct color_t WHITE = {40,0,50}; 



void set_LED_color(struct color_t col)
{
  analogWrite(LED_RED_PIN, col.r);
  analogWrite(LED_GREEN_PIN, col.g);
  analogWrite(LED_BLUE_PIN, col.b);  
}


//this is a total hack, but Arduino compiler and h files are not friends
void set_RED_LED(void) {
  set_LED_color(RED); 
}

void set_BLUE_LED(void) {
  set_LED_color(BLUE); 
}

void set_GREEN_LED(void) {
  set_LED_color(GREEN); 
}

void set_WHITE_LED(void) {
  set_LED_color(WHITE); 
}
