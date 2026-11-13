import * as T from 'three'

/** Local-space grain stays attached to a carving when it turns or moves. */
export function carvedMaterial() {
  let state = 167
  const bytes = new Uint8Array(128 * 128)
  for (let i = 0; i < bytes.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    bytes[i] = state >>> 24
  }
  const noise = new T.DataTexture(bytes, 128, 128, T.RedFormat)
  noise.wrapS = noise.wrapT = T.RepeatWrapping
  noise.magFilter = T.LinearFilter
  noise.minFilter = T.LinearMipmapLinearFilter
  noise.generateMipmaps = true
  noise.needsUpdate = true
  const material = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.86 })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.carvingNoise = { value: noise }
    shader.vertexShader = 'varying vec3 toyPos;\nvarying vec3 toyNormal;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\ntoyPos=position; toyNormal=normal;',
    )
    shader.fragmentShader =
      'uniform sampler2D carvingNoise;\nvarying vec3 toyPos;\nvarying vec3 toyNormal;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      vec3 norm = abs(normalize(toyNormal));
      vec2 uv = norm.y > .65 ? toyPos.xz : (norm.x > norm.z ? toyPos.zy : toyPos.xy);
      float fleck = texture2D(carvingNoise, uv*1.9).r-.5;
      float mottle = texture2D(carvingNoise, uv*.095).r-.5;
      float fibre = texture2D(carvingNoise, uv*vec2(.046,.49)).r-.5;
      diffuseColor.rgb *= 1.0 + .23*fleck + .15*mottle + .14*fibre;
    `,
    )
  }
  return { material, noise }
}
