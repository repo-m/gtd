'''
Design an application that, given a set of coordinates [(x1,y1), .., (xn,yn)], determines:
- the two closest points between each other 
- the two most distant points between each other 
- Use your knowledge of Clean and Maintainable Code to create an application with automated tests. 
-Start with tests or implementation, whatever is better for you.

'''

def calc_closest_points(sample_coordinates:list[tuple]) -> list[dict]:
    '''Calculates the two closest points from the coordinates and return list[tuple]'''
    temp_dist = 100
    
    #sample_coordinates_next = sample_coordinates[1:]
    for tu_p1 in sample_coordinates:
        for tu_p2 in sample_coordinates:
            if tu_x != tu_y:
                xp1 = tu_p1[0]
                yp1 = tu_p1[0]
                xp2 = tu_p2[0]
                yp2 = tu_p2[1]
                (*x1 + y2*y1)**(((tu_x[1]-tu_x[0])*(tu_x[1]-tu_x[0]) + (tu_y[1]-tu_y[0])*(tu_y[0]-tu_y[0])))/2
                print(tu_x, tu_y)

    result_x = tu_x
    result_y = tu_y

    #(d=\sqrt{(x_{2}-x_{1})^{2}+(y_{2}-y_{1})^{2}}\)

    return (result_x,result_y)

def main() -> None:
    '''This is the main entry point of the script.'''
    sample_coordinates = [(1, 1),(3, 3), (2,2), (4,4), (5,5)]
    calc_closest_points(sample_coordinates)



if __name__ == "__main__":
    main()