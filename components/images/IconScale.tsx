import React from 'react';

const IconScale = (
  {
    width = '24',
    height = '24',
    className,
  }: {
    width?: string;
    height?: string;
    className?: string;
  }
) => <svg
  width={ width }
  height={ height }
  className={ className }
  viewBox='0 0 96 82'
  fill='none'
  xmlns='http://www.w3.org/2000/svg'
>
  <path
    d='M0 51.2C0 55.4 1.7 59.3 4.7 62.3C7.6 65.3 11.6 66.9 15.8 66.9C24.4 66.9 31.5 59.9 31.5 51.2C31.5 50.4 31 49.6 30.2
    49.4L18.4 24.2L40.5 17.9C41.7 20 43.7 21.5 46 22.1V60.8H40.6C36.3 60.8 32.7 64.3 32.7 68.6V69.7C29.1 70.5 26.5 73.7 26.4
    77.4V80C26.4 81.1 27.3 82 28.4 82H67.3C68.4 82 69.3 81.1 69.3 80V77.3C69.3 73.6 66.7 70.4 63.1 69.6V68.5C63.1 64.2 59.5 60.7
    55.2 60.7H49.8V22C53.7 21.1 56.4 17.6 56.4 13.7C56.4 13.6 56.4 13.4 56.4 13.3L76.7 7.50001L65.9 30.8C65.1 31 64.5 31.8 64.5
    32.7C64.5 36.9 66.2 40.8 69.2 43.8C72.1 46.8 76.1 48.4 80.3 48.4C88.9 48.4 96 41.4 96 32.7C96 31.9 95.5 31.1 94.7 30.9L82.8
    5.70001L89.3 3.80001C90.3 3.50001 90.9 2.40001 90.6 1.40001C90.3 0.400014 89.2 -0.199986 88.2 0.100014L55.4 9.50001C53.9 6.80001
    51 5.10001 47.9 5.10001C43.2 5.10001 39.3 8.90001 39.3 13.7C39.3 13.8 39.3 14 39.3 14.1L6.6 23.5C5.6 23.8 5 24.9 5.3 25.9C5.6 26.9
    6.7 27.5 7.7 27.2L12.4 25.8L1.4 49.3C0.6 49.6 0 50.3 0 51.2ZM90.2 30.6H70.2L80.2 9.20001L90.2 30.6ZM68.5 34.5H91.8C90.9 40.2 86
    44.3 80.2 44.3C74.5 44.3 69.5 40.2 68.5 34.5ZM34.3 73.4H61.5C63.7 73.4 65.5 75.1 65.5 77.3V78.1H30.4V77.3C30.4 75.1 32.2 73.4
    34.3 73.4ZM40.6 64.6H55.3C57.5 64.6 59.3 66.3 59.3 68.5V69.5H36.6V68.5C36.6 66.3 38.4 64.6 40.6 64.6ZM43.5 15.1C43.5 15 43.5
    15 43.5 14.9C43.5 14.8 43.5 14.8 43.4 14.7C43.3 14.3 43.3 14 43.3 13.6C43.3 11 45.4 8.90001 48 8.90001C50.6 8.90001 52.7 11 52.7
    13.6C52.7 16.2 50.6 18.3 48 18.3C45.9 18.3 44.2 17 43.5 15.1ZM15.8 27.8L25.8 49.2H5.8L15.8 27.8ZM4.1 53.1H27.4C26.5 58.8 21.6 62.9
    15.8 62.9C10 62.9 5.1 58.8 4.1 53.1Z'
    fill='#457B9D'
  />
</svg>;

export default IconScale;
