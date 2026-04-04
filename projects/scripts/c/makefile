# --- Paths ---------------------------------------------------------------------------------------
OBJDIR = bin
SRCDIR = .
TARGET = $(OBJDIR)/test_parser

# --- Compiler and Flags --------------------------------------------------------------------------
CC = gcc                        # The compiler to use
CFLAGS = -std=c11 -Wall -Wextra -Wpedantic -O0 -g   # Compiler options: C11, show all warnings, no optimization, include debug info
DEFS = -Dmain=wp2_demo_main     # Macro definition: rename 'main' in wp2 source to avoid conflicts during testing

# --- Sources and Objects -------------------------------------------------------------------------
SRC = wp2_day5_CAN_logger.c wp7_day5_test_parse.c   # List of all source files
OBJ = $(OBJDIR)/wp2.o $(OBJDIR)/test.o                                 # Object files generated from those sources

# --- Default Target ------------------------------------------------------------------------------
all: $(OBJDIR)/test_parser                # 'make' without arguments builds 'test_parser' by default

# Create output directory if missing
$(OBJDIR):
	mkdir -p $(OBJDIR)

# --- Compile Rules -------------------------------------------------------------------------------
$(OBJDIR)/wp2.o: $(SRCDIR)/wp2_day5_CAN_logger.c parser.h               # wp2.o depends on its source and header
	$(CC) $(CFLAGS) $(DEFS) -c $< -o $@             # $< = first dependency, $@ = target name

$(OBJDIR)/test.o: $(SRCDIR)wp7_day5_test_parse.c parser.h              # test.o depends on its source and header
	$(CC) $(CFLAGS) -c $< -o $@                     # Compile test source into object file

# --- Link Rule (Link Objects into Final Executable) ----------------------------------------------
$(TARGET): $(OBJ)                                 # Link both objects into one binary
	$(CC) $(CFLAGS) $^ -o $@                        # $^ = all dependencies (here: both .o files)

# --- Clean Rule (Utility Target to Clean the Build) ----------------------------------------------
.PHONY: clean                                       # 'clean' is a phony target (not a file)
clean:
	rm -f $(OBJDIR)                        # Remove object files and executable
