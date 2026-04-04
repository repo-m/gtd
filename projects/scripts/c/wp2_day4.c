/*Parse lines like id=23,value=16,status=0 into a Sensor struct with bounds checks and a small test loop.*/

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

#define LIMIT 100

typedef struct{
    int16_t id;
    int16_t value;
    int16_t status;
} Sensor;

int get_sensor_data(Sensor *s, const char *p);

int get_sensor_data(Sensor *s, const char *p){
    int return_value = 0;
    char trailing = '0';

    if(sscanf(p, "%hd,%hd,%hd %c", &s->id, &s->value, &s->status, &trailing) == 3){
        return_value = 0;
    }
    else{
        return_value = 1;
    }

    return return_value;
}

int main (void){

    Sensor temp = {0, 0, 0};
    Sensor *sensor = NULL;
    char buffer[LIMIT];
    size_t sensor_size = 0;
    int number_of_data = 0;

    while(fgets(buffer, sizeof(buffer), stdin)){
        if(get_sensor_data(&temp, buffer) == 0){
            sensor_size++;
            sensor = realloc(sensor, sensor_size * sizeof(Sensor));
            sensor[sensor_size - 1].id = temp.id;
            sensor[sensor_size - 1].value = temp.value;
            sensor[sensor_size - 1].status = temp.status;
        }
    }

    for(size_t i = 0; i < sensor_size; i++){
        printf("id:%hd value:%hd status:%hd\n", sensor[i].id, sensor[i].value, sensor[i].status);
    }

    free(sensor);
    return 0;
}
