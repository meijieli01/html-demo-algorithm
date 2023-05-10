import { Matrix4 } from 'three';

export function arrayVectorToMatrix(arrVector) {
    const mat = new Matrix4();
    mat.set(
        arrVector[0][0], arrVector[0][1], arrVector[0][2], arrVector[0][3], 
        arrVector[1][0], arrVector[1][1], arrVector[1][2], arrVector[1][3], 
        arrVector[2][0], arrVector[2][1], arrVector[2][2], arrVector[2][3], 
        arrVector[3][0], arrVector[3][1], arrVector[3][2], arrVector[3][3], 
    )
    return mat;
}