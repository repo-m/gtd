/*
Task: CAN Log Analyzer

Write a C program that:
1. Reads CAN log lines from stdin until EOF.
2. Ignores comment lines (starting with '#').
3. For each valid frame, parse:
   - Timestamp
   - CAN ID
   - DLC (or "FD")
   - Data payload
4. Track statistics:
   - Total number of frames
   - Number of unique CAN IDs
   - Number of CAN FD frames
   - Number of invalid lines
   - For each CAN ID: count of frames, first/last timestamp, average period
5. Detect UDS traffic by the first data byte:
   - Requests (0x00–0x3F)
   - Positive responses (SID = request + 0x40)
   - Negative responses (SID = 0x7F)
6. Print a summary with all statistics and per-ID details.
*/

#include <stdio.h>
#include <stdlib.h>

#define MAX 256

typedef struct {
    unsigned int id;
    int frame_counter;
    double first_ts;
    double last_ts;
} CanMessage;

int main (){
    char buffer[MAX];
    double timestamp;
    unsigned int can_id;
    int dlc;
    char data[MAX];
    int total_frames = 0;
    int new_message = 0;
    int messages_size = 0;
    int number_of_unique_ids = 0;
    int canfd_messages = 0;
    int count_invalid = 0;
    unsigned int uds;
    int c_req = 0;
    int c_pos = 0;
    int c_nrc = 0;

    CanMessage *messages = NULL;
    int count = 0;

    while(fgets(buffer, sizeof(buffer), stdin)){

        //skip comments
        if(buffer[0] == '#' || buffer[0] == '\n') continue;
        
        //parse data
        if(sscanf(buffer, "%lf 0x%x %d %x %255[^\n]", &timestamp, &can_id, &dlc, &uds, data)>=4){
            printf("Time stamp: %0.3lf, CAN ID: %03X, DLC: %d, uds: %x, data: %s \n", timestamp, can_id, dlc, uds, data);
            total_frames++;
            if(uds <= 0x3F) c_req++;
            else if(uds == 0x7F) c_nrc++;
            else if(uds <= 0x7E) c_pos++;

            //UDS summary: req=2, pos=1, nrc=1

            //check CAN-ID
            new_message = 1;
            for(int i=0;i < messages_size; i++){
                if(messages[i].id == can_id){
                  messages[i].frame_counter++;
                  messages[i].last_ts = timestamp;
                  new_message = 0;
                  break;
                }
            }

            if(new_message == 1){
                messages_size++;
                messages = realloc(messages, messages_size * sizeof(CanMessage));
                messages[messages_size-1].id = can_id;
                messages[messages_size-1].frame_counter = 1;
                messages[messages_size-1].first_ts = timestamp;
                messages[messages_size-1].last_ts = timestamp;
                number_of_unique_ids++;
            }

        } else if (sscanf(buffer, "%lf 0x%x FD %255[^\n]", &timestamp, &can_id, data)>=3){
            printf("Time stamp: %0.3f, CAN ID: %03X, DLC: FD data: %s \n", timestamp, can_id, data);
            total_frames++;
            canfd_messages++;
        } else {
            printf("Invalid input %s\n", buffer);
            count_invalid++;
        }
  }
  //results
  printf("\n\nTotal count of frames: %d\n", total_frames);
  printf("Total count of unique messages: %d\n", number_of_unique_ids);
  printf("Total count of can fd messages: %d\n", canfd_messages);
  printf("Total count of invalid messages: %d\n", count_invalid);
  printf("Total count of uds_req: %d\n", c_req);
  printf("Total count of uds_nrc: %d\n", c_nrc);
  printf("Total count of uds_pos: %d\n", c_pos);

  for(int i=0;i < messages_size; i++){
      printf("CAN ID: %03X, Count of frames: %d, First time stamp: %.3f, Last time stamp: %.3f, Average time: %.3f\n",
        messages[i].id, messages[i].frame_counter, messages[i].first_ts, messages[i].last_ts,
        (messages[i].frame_counter<2) ? 0 : (messages[i].last_ts - messages[i].first_ts)*1000.0 / (messages[i].frame_counter-1));
  }
  //avg_ms = (cnt<2)?NAN: (last-first)*1000.0/(cnt-1
  free(messages);
  return 0;
}
