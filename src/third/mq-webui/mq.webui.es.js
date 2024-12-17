class MqRaycast {
  constructor(lib3, viewer) {
    this.lib3 = lib3;
    this.viewer = viewer;
    this.raycast = new lib3.Raycaster();
  }
  pickMesh(pt, targets, camera, options = {}) {
    let recursive = true;
    if (typeof options.recursive) recursive = options.recursive;
    this.raycast.setFromCamera(pt, camera);
    const intersects = this.raycast.intersectObjects(targets, recursive);
    return intersects[0];
  }
}
function createMarkSphere(lib3, options = {}) {
  const geo = new lib3.SphereGeometry(options.sphereRadius || 0.75, 32, 32);
  const mat = new lib3.MeshLambertMaterial({ color: 16711680 });
  const mark = new lib3.Mesh(geo, mat);
  mark.name = options.name || `mark_sphere_${Date.now()}`;
  if (options.point) {
    mark.position.fromArray(options.point);
  }
  if (options.mat) {
    mark.applayMatrix4(options.mat);
    mark.updateMatrix();
  }
  return mark;
}
export {
  MqRaycast,
  createMarkSphere
};
