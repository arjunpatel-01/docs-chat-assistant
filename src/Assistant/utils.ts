/**
 * Function that returns a unique identifier as a string.
 * @returns {string}
 */
export function UID(): string {
    return Date.now() + Math.random().toString(36).slice(2);
}

/**
 * Maps string color input to defined hex values.
 * @param {string} color
 * @returns {string} hexValue
 */
function colorNameToHex (color: string): string {
    let hexVal: string;
    switch (color.toLowerCase()) {
        case 'black':
            hexVal = '#000000';
            break;
        case 'silver':
            hexVal = '#c0c0c0';
            break;
        case 'gray':
            hexVal = '#808080';
            break;
        case 'white':
            hexVal = '#ffffff';
            break;
        case 'maroon':
            hexVal = '#800000';
            break;
        case 'red':
            hexVal = '#ff0000';
            break;
        case 'purple':
            hexVal = '#800080';
            break;
        case 'fuchsia':
            hexVal = '#ff00ff';
            break;
        case 'green':
            hexVal = '#008000';
            break;
        case 'lime':
            hexVal = '#00ff00';
            break;
        case 'olive':
            hexVal = '#808000';
            break;
        case 'yellow':
            hexVal = '#ffff00';
            break;
        case 'navy':
            hexVal = '#000080';
            break;
        case 'blue':
            hexVal = '#0000ff';
            break;
        case 'teal':
            hexVal = '#008080';
            break;
        case 'aqua':
            hexVal = '#00ffff';
            break;
        case 'info':
            hexVal = '#0288d1';
            break;
        case 'error':
            hexVal = '#d32f2f';
            break;
        case 'success':
            hexVal = '#2e7d32';
            break;
        case 'warning':
            hexVal = '#ed6c02';
            break;
        default: 
            console.error(`\n'${color}' is an invalid color name. \nValid: MDN standard color name | 'info' | 'success' | 'error' | 'warning' | hex value | rgb value.`);
            hexVal = "#0288d1";
    }

    return hexVal;
}

/**
 * Validates color input based on hex code, rgb value, or pre-defined color name.
 * @param color 
 * @returns {string} hex code or rgb value
 */
export function validateColor(color: string | null | undefined): string {
    if (color) {
        if (color.startsWith('#') || /rgb\(\d+,\d+,\d+\)/.test(color)) {
            return color;
        } else {
            return colorNameToHex(color);
        }
    } else {
        return '#0288d1';
    }
}

// export function getDir() {
//     console.log(`Current Dir: ${process.cwd()}`);
// }