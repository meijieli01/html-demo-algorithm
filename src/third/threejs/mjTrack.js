import { Object3D, Material, Texture } from 'three';

export class TrackerResource {
    constructor() {
        this.resourceSet = new Set();
    }
    track(resource) {
        if (!resource) {
            return resource;
        }
        // handle children and when material is an array of material or 
        // unifom is array textures
        if (Array.isArray(resource)) {
            resource.forEach(child => this.track(child));
            return resource;
        }
        if (resource.dispose || resource instanceof Object3D) {
            this.resourceSet.add(resource);
        }
        if (resource instanceof Object3D) {
            this.track(resource.geometry);
            this.track(resource.material);
            this.track(resource.children);
        } else if (resource instanceof Material) {
            for (const value of Object.values(resource)) {
                if (value instanceof Texture) {
                    this.track(value);
                }
            }
            if (resource.uniforms) {
                for (const value of Object.values(resource.uniforms)) {
                    if (value) {
                        const uniformValue = value.value;
                        if (uniformValue instanceof Texture || Array.isArray(uniformValue)) {
                            this.track(uniformValue);
                        }
                    }
                }
            }
        }
        return resource;
    }
    untrack(resource) {
        this.resourceSet.delete(resource);
    }
    dispose() {
        for (const item of this.resourceSet) {
            if (item instanceof Object3D) {
                if (item.parent) {
                    item.parent.remove(item);
                }
            }
            if (item.dispose) {
                item.dispose();
            }
        }
        this.resourceSet.clear();
    }
}