import { degree2Radian } from './utils'
/**
 * threejs matrix3
 * src\math\Matrix3.js
 * row-major
 * 小程序中class命名为Matrix3, ThreeMatrix3报错 is not a constructor
 */
class MjMatrix {
    constructor() {
        this.elements = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }
    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
        const te = this.elements;
        te[0] = n11; te[1] = n21; te[2] = n31;
        te[3] = n12; te[4] = n22; te[5] = n32;
        te[6] = n13; te[7] = n23; te[8] = n33;
    }
    identity() {
        this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        );
        return this;
    }

	copy( m ) {

		const te = this.elements;
		const me = m.elements;

		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
		te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
		te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];

		return this;

	}
    multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}
    multiplyMatrices(a, b) {

        const ae = a.elements;
		const be = b.elements;
		const te = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
		const a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
		const a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

		const b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
		const b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
		const b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
		te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
		te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
		te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

		return this;
    }
    multiplyScalar( s ) {

		const te = this.elements;

		te[ 0 ] *= s; te[ 3 ] *= s; te[ 6 ] *= s;
		te[ 1 ] *= s; te[ 4 ] *= s; te[ 7 ] *= s;
		te[ 2 ] *= s; te[ 5 ] *= s; te[ 8 ] *= s;

		return this;

	}

	determinant() {

		const te = this.elements;

		const a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
			d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
			g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];

		return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

	}

	invert() {

		const te = this.elements,

			n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ],
			n12 = te[ 3 ], n22 = te[ 4 ], n32 = te[ 5 ],
			n13 = te[ 6 ], n23 = te[ 7 ], n33 = te[ 8 ],

			t11 = n33 * n22 - n32 * n23,
			t12 = n32 * n13 - n33 * n12,
			t13 = n23 * n12 - n22 * n13,

			det = n11 * t11 + n21 * t12 + n31 * t13;

		if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );

		const detInv = 1 / det;

		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
		te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

		te[ 3 ] = t12 * detInv;
		te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
		te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

		te[ 6 ] = t13 * detInv;
		te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
		te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

		return this;

	}
    transpose() {

		let tmp;
		const m = this.elements;

		tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
		tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
		tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;

		return this;

	}
    scale( sx, sy ) {

		this.premultiply( _m3.makeScale( sx, sy ) );

		return this;

	}

	rotate( theta ) {

		this.premultiply( _m3.makeRotation( - theta ) );

		return this;

	}

	translate( tx, ty ) {

		this.premultiply( _m3.makeTranslation( tx, ty ) );

		return this;

	}
    // for 2D Transforms

	makeTranslation( x, y ) {

		this.set(

			1, 0, x,
			0, 1, y,
			0, 0, 1

		);

		return this;

	}
    makeRotation( theta ) {

		// counterclockwise

		const c = Math.cos( theta );
		const s = Math.sin( theta );

		this.set(

			c, - s, 0,
			s, c, 0,
			0, 0, 1

		);

		return this;

	}

    makeScale( x, y ) {

		this.set(

			x, 0, 0,
			0, y, 0,
			0, 0, 1

		);

		return this;

	}
}
const _m3 = new MjMatrix();

/**
 * 
 * @param {*} p 
 * @param {*} m 
 * @returns 
 */
export function pointApplyMatrix3( p, m ) {

    const ox = p.x, oy = p.y;
    const e = m.elements;

    const x = e[ 0 ] * ox + e[ 3 ] * oy + e[ 6 ];
    const y = e[ 1 ] * ox + e[ 4 ] * oy + e[ 7 ];

    return { x, y};
}

/**
 * https://github.com/trusktr/geometry-interfaces/blob/master/src/DOMMatrix.js
 * @param {*} angle 
 */
export function rotateAxisAngleArray(x, y, z, angle) {
    const {sin, cos, pow} = Math

    const halfAngle = degree2Radian(angle/2)

    // TODO: should we provide a 6-item array here to signify 2D when the
    // rotation is about the Z axis (for example when calling rotateSelf)?
    // TODO: Performance can be improved by first detecting when x, y, or z of
    // the axis are zero or 1, and using a pre-simplified version of the
    // folowing math based on that condition.
    // TODO: Performance can be improved by using different equations (use trig
    // identities to find alternate formulas).
    return [
        1-2*(y*y + z*z)*pow(sin(halfAngle), 2),                           2*(x*y*pow(sin(halfAngle), 2) + z*sin(halfAngle)*cos(halfAngle)), 2*(x*z*pow(sin(halfAngle), 2) - y*sin(halfAngle)*cos(halfAngle)), 0,
        2*(x*y*pow(sin(halfAngle), 2) - z*sin(halfAngle)*cos(halfAngle)), 1-2*(x*x + z*z)*pow(sin(halfAngle), 2),                           2*(y*z*pow(sin(halfAngle), 2) + x*sin(halfAngle)*cos(halfAngle)), 0,
        2*(x*z*pow(sin(halfAngle), 2) + y*sin(halfAngle)*cos(halfAngle)), 2*(y*z*pow(sin(halfAngle), 2) - x*sin(halfAngle)*cos(halfAngle)), 1-2*(x*x + y*y)*pow(sin(halfAngle), 2),                           0,
        0,                                                                0,                                                                0,                                                                1,
    ]
}
export function polyfillDomMatrixRotate(angle) {
	// axis of rotation
	const [x,y,z] = [0,0,1] // We're rotating around the Z axis.
	const numberSequence16 = rotateAxisAngleArray(x, y, z, angle);
	return `matrix(
		${numberSequence16[0]},
		${numberSequence16[1]},
		${numberSequence16[4]},
		${numberSequence16[5]},
		${numberSequence16[12]},
		${numberSequence16[13]}
	)`
}	

export {
    MjMatrix,
}