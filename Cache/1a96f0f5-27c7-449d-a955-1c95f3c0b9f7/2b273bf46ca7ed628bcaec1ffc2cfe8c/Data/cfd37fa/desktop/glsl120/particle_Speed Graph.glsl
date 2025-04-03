//#include <required.glsl> // [HACK 4/6/2023] See SCC shader_merger.cpp
//SG_REFLECTION_BEGIN(200)
//attribute vec4 boneData 5
//attribute vec3 blendShape0Pos 6
//attribute vec3 blendShape0Normal 12
//attribute vec3 blendShape1Pos 7
//attribute vec3 blendShape1Normal 13
//attribute vec3 blendShape2Pos 8
//attribute vec3 blendShape2Normal 14
//attribute vec3 blendShape3Pos 9
//attribute vec3 blendShape4Pos 10
//attribute vec3 blendShape5Pos 11
//attribute vec4 position 0
//attribute vec3 normal 1
//attribute vec4 tangent 2
//attribute vec2 texture0 3
//attribute vec2 texture1 4
//attribute vec4 color 18
//attribute vec3 positionNext 15
//attribute vec3 positionPrevious 16
//attribute vec4 strandProperties 17
//sampler sampler colorRampTextureSmpSC 0:20
//sampler sampler intensityTextureSmpSC 0:21
//sampler sampler mainTextureSmpSC 0:22
//sampler sampler sc_OITCommonSampler 0:25
//sampler sampler sc_ScreenTextureSmpSC 0:27
//sampler sampler sizeRampTextureSmpSC 0:30
//sampler sampler vectorTextureSmpSC 0:31
//sampler sampler velRampTextureSmpSC 0:32
//texture texture2D colorRampTexture 0:0:0:20
//texture texture2D intensityTexture 0:1:0:21
//texture texture2D mainTexture 0:2:0:22
//texture texture2D sc_OITAlpha0 0:5:0:25
//texture texture2D sc_OITAlpha1 0:6:0:25
//texture texture2D sc_OITDepthHigh0 0:7:0:25
//texture texture2D sc_OITDepthHigh1 0:8:0:25
//texture texture2D sc_OITDepthLow0 0:9:0:25
//texture texture2D sc_OITDepthLow1 0:10:0:25
//texture texture2D sc_OITFilteredDepthBoundsTexture 0:11:0:25
//texture texture2D sc_OITFrontDepthTexture 0:12:0:25
//texture texture2D sc_ScreenTexture 0:14:0:27
//texture texture2D sizeRampTexture 0:17:0:30
//texture texture2D vectorTexture 0:18:0:31
//texture texture2D velRampTexture 0:19:0:32
//SG_REFLECTION_END
#if defined VERTEX_SHADER
#if 0
NGS_BACKEND_SHADER_FLAGS_BEGIN__
NGS_BACKEND_SHADER_FLAGS_END__
#endif
#define SC_DISABLE_FRUSTUM_CULLING
#ifdef ALIGNTOX
#undef ALIGNTOX
#endif
#ifdef ALIGNTOY
#undef ALIGNTOY
#endif
#ifdef ALIGNTOZ
#undef ALIGNTOZ
#endif
#define sc_StereoRendering_Disabled 0
#define sc_StereoRendering_InstancedClipped 1
#define sc_StereoRendering_Multiview 2
#ifdef GL_ES
    #define SC_GLES_VERSION_20 2000
    #define SC_GLES_VERSION_30 3000
    #define SC_GLES_VERSION_31 3100
    #define SC_GLES_VERSION_32 3200
#endif
#ifdef VERTEX_SHADER
    #define scOutPos(clipPosition) gl_Position=clipPosition
    #define MAIN main
#endif
#ifdef SC_ENABLE_INSTANCED_RENDERING
    #ifndef sc_EnableInstancing
        #define sc_EnableInstancing 1
    #endif
#endif
#define mod(x,y) (x-y*floor((x+1e-6)/y))
#if defined(GL_ES)&&(__VERSION__<300)&&!defined(GL_OES_standard_derivatives)
#define dFdx(A) (A)
#define dFdy(A) (A)
#define fwidth(A) (A)
#endif
#if __VERSION__<300
#define isinf(x) (x!=0.0&&x*2.0==x ? true : false)
#define isnan(x) (x>0.0||x<0.0||x==0.0 ? false : true)
#define inverse(M) M
#endif
#ifdef sc_EnableFeatureLevelES3
    #ifdef sc_EnableStereoClipDistance
        #if defined(GL_APPLE_clip_distance)
            #extension GL_APPLE_clip_distance : require
        #elif defined(GL_EXT_clip_cull_distance)
            #extension GL_EXT_clip_cull_distance : require
        #else
            #error Clip distance is requested but not supported by this device.
        #endif
    #endif
#else
    #ifdef sc_EnableStereoClipDistance
        #error Clip distance is requested but not supported by this device.
    #endif
#endif
#ifdef sc_EnableFeatureLevelES3
    #ifdef VERTEX_SHADER
        #define attribute in
        #define varying out
    #endif
    #ifdef FRAGMENT_SHADER
        #define varying in
    #endif
    #define gl_FragColor sc_FragData0
    #define texture2D texture
    #define texture2DLod textureLod
    #define texture2DLodEXT textureLod
    #define textureCubeLodEXT textureLod
    #define sc_CanUseTextureLod 1
#else
    #ifdef FRAGMENT_SHADER
        #if defined(GL_EXT_shader_texture_lod)
            #extension GL_EXT_shader_texture_lod : require
            #define sc_CanUseTextureLod 1
            #define texture2DLod texture2DLodEXT
        #endif
    #endif
#endif
#if defined(sc_EnableMultiviewStereoRendering)
    #define sc_StereoRenderingMode sc_StereoRendering_Multiview
    #define sc_NumStereoViews 2
    #extension GL_OVR_multiview2 : require
    #ifdef VERTEX_SHADER
        #ifdef sc_EnableInstancingFallback
            #define sc_GlobalInstanceID (sc_FallbackInstanceID*2+gl_InstanceID)
        #else
            #define sc_GlobalInstanceID gl_InstanceID
        #endif
        #define sc_LocalInstanceID sc_GlobalInstanceID
        #define sc_StereoViewID int(gl_ViewID_OVR)
    #endif
#elif defined(sc_EnableInstancedClippedStereoRendering)
    #ifndef sc_EnableInstancing
        #error Instanced-clipped stereo rendering requires enabled instancing.
    #endif
    #ifndef sc_EnableStereoClipDistance
        #define sc_StereoRendering_IsClipDistanceEnabled 0
    #else
        #define sc_StereoRendering_IsClipDistanceEnabled 1
    #endif
    #define sc_StereoRenderingMode sc_StereoRendering_InstancedClipped
    #define sc_NumStereoClipPlanes 1
    #define sc_NumStereoViews 2
    #ifdef VERTEX_SHADER
        #ifdef sc_EnableInstancingFallback
            #define sc_GlobalInstanceID (sc_FallbackInstanceID*2+gl_InstanceID)
        #else
            #define sc_GlobalInstanceID gl_InstanceID
        #endif
        #ifdef sc_EnableFeatureLevelES3
            #define sc_LocalInstanceID (sc_GlobalInstanceID/2)
            #define sc_StereoViewID (sc_GlobalInstanceID%2)
        #else
            #define sc_LocalInstanceID int(sc_GlobalInstanceID/2.0)
            #define sc_StereoViewID int(mod(sc_GlobalInstanceID,2.0))
        #endif
    #endif
#else
    #define sc_StereoRenderingMode sc_StereoRendering_Disabled
#endif
#ifdef VERTEX_SHADER
    #ifdef sc_EnableInstancing
        #ifdef GL_ES
            #if defined(sc_EnableFeatureLevelES2)&&!defined(GL_EXT_draw_instanced)
                #define gl_InstanceID (0)
            #endif
        #else
            #if defined(sc_EnableFeatureLevelES2)&&!defined(GL_EXT_draw_instanced)&&!defined(GL_ARB_draw_instanced)&&!defined(GL_EXT_gpu_shader4)
                #define gl_InstanceID (0)
            #endif
        #endif
        #ifdef GL_ARB_draw_instanced
            #extension GL_ARB_draw_instanced : require
            #define gl_InstanceID gl_InstanceIDARB
        #endif
        #ifdef GL_EXT_draw_instanced
            #extension GL_EXT_draw_instanced : require
            #define gl_InstanceID gl_InstanceIDEXT
        #endif
        #ifndef sc_InstanceID
            #define sc_InstanceID gl_InstanceID
        #endif
        #ifndef sc_GlobalInstanceID
            #ifdef sc_EnableInstancingFallback
                #define sc_GlobalInstanceID (sc_FallbackInstanceID)
                #define sc_LocalInstanceID (sc_FallbackInstanceID)
            #else
                #define sc_GlobalInstanceID gl_InstanceID
                #define sc_LocalInstanceID gl_InstanceID
            #endif
        #endif
    #endif
#endif
#ifdef VERTEX_SHADER
    #if (__VERSION__<300)&&!defined(GL_EXT_gpu_shader4)
        #define gl_VertexID (0)
    #endif
#endif
#ifndef GL_ES
        #extension GL_EXT_gpu_shader4 : enable
    #extension GL_ARB_shader_texture_lod : enable
    #ifndef texture2DLodEXT
        #define texture2DLodEXT texture2DLod
    #endif
    #ifndef sc_CanUseTextureLod
    #define sc_CanUseTextureLod 1
    #endif
    #define precision
    #define lowp
    #define mediump
    #define highp
    #define sc_FragmentPrecision
#endif
#ifdef sc_EnableFeatureLevelES3
    #define sc_CanUseSampler2DArray 1
#endif
#if defined(sc_EnableFeatureLevelES2)&&defined(GL_ES)
    #ifdef FRAGMENT_SHADER
        #ifdef GL_OES_standard_derivatives
            #extension GL_OES_standard_derivatives : require
            #define sc_CanUseStandardDerivatives 1
        #endif
    #endif
    #ifdef GL_EXT_texture_array
        #extension GL_EXT_texture_array : require
        #define sc_CanUseSampler2DArray 1
    #else
        #define sc_CanUseSampler2DArray 0
    #endif
#endif
#ifdef GL_ES
    #ifdef sc_FramebufferFetch
        #if defined(GL_EXT_shader_framebuffer_fetch)
            #extension GL_EXT_shader_framebuffer_fetch : require
        #elif defined(GL_ARM_shader_framebuffer_fetch)
            #extension GL_ARM_shader_framebuffer_fetch : require
        #else
            #error Framebuffer fetch is requested but not supported by this device.
        #endif
    #endif
    #ifdef GL_FRAGMENT_PRECISION_HIGH
        #define sc_FragmentPrecision highp
    #else
        #define sc_FragmentPrecision mediump
    #endif
    #ifdef FRAGMENT_SHADER
        precision highp int;
        precision highp float;
    #endif
#endif
#ifdef VERTEX_SHADER
    #ifdef sc_EnableMultiviewStereoRendering
        layout(num_views=sc_NumStereoViews) in;
    #endif
#endif
#if __VERSION__>100
    #define SC_INT_FALLBACK_FLOAT int
    #define SC_INTERPOLATION_FLAT flat
    #define SC_INTERPOLATION_CENTROID centroid
#else
    #define SC_INT_FALLBACK_FLOAT float
    #define SC_INTERPOLATION_FLAT
    #define SC_INTERPOLATION_CENTROID
#endif
#ifndef sc_NumStereoViews
    #define sc_NumStereoViews 1
#endif
#ifndef sc_CanUseSampler2DArray
    #define sc_CanUseSampler2DArray 0
#endif
    #if __VERSION__==100||defined(SCC_VALIDATION)
        #define sampler2DArray vec2
        #define sampler3D vec3
        #define samplerCube vec4
        vec4 texture3D(vec3 s,vec3 uv)                       { return vec4(0.0); }
        vec4 texture3D(vec3 s,vec3 uv,float bias)           { return vec4(0.0); }
        vec4 texture3DLod(vec3 s,vec3 uv,float bias)        { return vec4(0.0); }
        vec4 texture3DLodEXT(vec3 s,vec3 uv,float lod)      { return vec4(0.0); }
        vec4 texture2DArray(vec2 s,vec3 uv)                  { return vec4(0.0); }
        vec4 texture2DArray(vec2 s,vec3 uv,float bias)      { return vec4(0.0); }
        vec4 texture2DArrayLod(vec2 s,vec3 uv,float lod)    { return vec4(0.0); }
        vec4 texture2DArrayLodEXT(vec2 s,vec3 uv,float lod) { return vec4(0.0); }
        vec4 textureCube(vec4 s,vec3 uv)                     { return vec4(0.0); }
        vec4 textureCube(vec4 s,vec3 uv,float lod)          { return vec4(0.0); }
        vec4 textureCubeLod(vec4 s,vec3 uv,float lod)       { return vec4(0.0); }
        vec4 textureCubeLodEXT(vec4 s,vec3 uv,float lod)    { return vec4(0.0); }
        #if defined(VERTEX_SHADER)||!sc_CanUseTextureLod
            #define texture2DLod(s,uv,lod)      vec4(0.0)
            #define texture2DLodEXT(s,uv,lod)   vec4(0.0)
        #endif
    #elif __VERSION__>=300
        #define texture3D texture
        #define textureCube texture
        #define texture2DArray texture
        #define texture2DLod textureLod
        #define texture3DLod textureLod
        #define texture2DLodEXT textureLod
        #define texture3DLodEXT textureLod
        #define textureCubeLod textureLod
        #define textureCubeLodEXT textureLod
        #define texture2DArrayLod textureLod
        #define texture2DArrayLodEXT textureLod
    #endif
    #ifndef sc_TextureRenderingLayout_Regular
        #define sc_TextureRenderingLayout_Regular 0
        #define sc_TextureRenderingLayout_StereoInstancedClipped 1
        #define sc_TextureRenderingLayout_StereoMultiview 2
    #endif
    #define depthToGlobal   depthScreenToViewSpace
    #define depthToLocal    depthViewToScreenSpace
    #ifndef quantizeUV
        #define quantizeUV sc_QuantizeUV
        #define sc_platformUVFlip sc_PlatformFlipV
        #define sc_PlatformFlipUV sc_PlatformFlipV
    #endif
    #ifndef sc_texture2DLod
        #define sc_texture2DLod sc_InternalTextureLevel
        #define sc_textureLod sc_InternalTextureLevel
        #define sc_textureBias sc_InternalTextureBiasOrLevel
        #define sc_texture sc_InternalTexture
    #endif
struct sc_Vertex_t
{
vec4 position;
vec3 normal;
vec3 tangent;
vec2 texture0;
vec2 texture1;
};
#ifndef sc_CanUseTextureLod
#define sc_CanUseTextureLod 0
#elif sc_CanUseTextureLod==1
#undef sc_CanUseTextureLod
#define sc_CanUseTextureLod 1
#endif
#ifndef sc_StereoRenderingMode
#define sc_StereoRenderingMode 0
#endif
#ifndef sc_StereoViewID
#define sc_StereoViewID 0
#endif
#ifndef sc_RenderingSpace
#define sc_RenderingSpace -1
#endif
#ifndef sc_StereoRendering_IsClipDistanceEnabled
#define sc_StereoRendering_IsClipDistanceEnabled 0
#endif
#ifndef sc_NumStereoViews
#define sc_NumStereoViews 1
#endif
#ifndef sc_ShaderCacheConstant
#define sc_ShaderCacheConstant 0
#endif
#ifndef sc_SkinBonesCount
#define sc_SkinBonesCount 0
#endif
#ifndef sc_VertexBlending
#define sc_VertexBlending 0
#elif sc_VertexBlending==1
#undef sc_VertexBlending
#define sc_VertexBlending 1
#endif
#ifndef sc_VertexBlendingUseNormals
#define sc_VertexBlendingUseNormals 0
#elif sc_VertexBlendingUseNormals==1
#undef sc_VertexBlendingUseNormals
#define sc_VertexBlendingUseNormals 1
#endif
struct sc_Camera_t
{
vec3 position;
float aspect;
vec2 clipPlanes;
};
#ifndef sc_IsEditor
#define sc_IsEditor 0
#elif sc_IsEditor==1
#undef sc_IsEditor
#define sc_IsEditor 1
#endif
#ifndef SC_DISABLE_FRUSTUM_CULLING
#define SC_DISABLE_FRUSTUM_CULLING 0
#elif SC_DISABLE_FRUSTUM_CULLING==1
#undef SC_DISABLE_FRUSTUM_CULLING
#define SC_DISABLE_FRUSTUM_CULLING 1
#endif
#ifndef sc_DepthBufferMode
#define sc_DepthBufferMode 0
#endif
#ifndef sc_ProjectiveShadowsReceiver
#define sc_ProjectiveShadowsReceiver 0
#elif sc_ProjectiveShadowsReceiver==1
#undef sc_ProjectiveShadowsReceiver
#define sc_ProjectiveShadowsReceiver 1
#endif
#ifndef sc_OITDepthGatherPass
#define sc_OITDepthGatherPass 0
#elif sc_OITDepthGatherPass==1
#undef sc_OITDepthGatherPass
#define sc_OITDepthGatherPass 1
#endif
#ifndef sc_OITCompositingPass
#define sc_OITCompositingPass 0
#elif sc_OITCompositingPass==1
#undef sc_OITCompositingPass
#define sc_OITCompositingPass 1
#endif
#ifndef sc_OITDepthBoundsPass
#define sc_OITDepthBoundsPass 0
#elif sc_OITDepthBoundsPass==1
#undef sc_OITDepthBoundsPass
#define sc_OITDepthBoundsPass 1
#endif
#ifndef SC_DEVICE_CLASS
#define SC_DEVICE_CLASS -1
#endif
#ifndef SC_GL_FRAGMENT_PRECISION_HIGH
#define SC_GL_FRAGMENT_PRECISION_HIGH 0
#elif SC_GL_FRAGMENT_PRECISION_HIGH==1
#undef SC_GL_FRAGMENT_PRECISION_HIGH
#define SC_GL_FRAGMENT_PRECISION_HIGH 1
#endif
#ifndef UseViewSpaceDepthVariant
#define UseViewSpaceDepthVariant 1
#elif UseViewSpaceDepthVariant==1
#undef UseViewSpaceDepthVariant
#define UseViewSpaceDepthVariant 1
#endif
#ifndef sizeRampTextureHasSwappedViews
#define sizeRampTextureHasSwappedViews 0
#elif sizeRampTextureHasSwappedViews==1
#undef sizeRampTextureHasSwappedViews
#define sizeRampTextureHasSwappedViews 1
#endif
#ifndef sizeRampTextureLayout
#define sizeRampTextureLayout 0
#endif
#ifndef velRampTextureHasSwappedViews
#define velRampTextureHasSwappedViews 0
#elif velRampTextureHasSwappedViews==1
#undef velRampTextureHasSwappedViews
#define velRampTextureHasSwappedViews 1
#endif
#ifndef velRampTextureLayout
#define velRampTextureLayout 0
#endif
#ifndef MAXPARTICLECOUNT
#define MAXPARTICLECOUNT 0
#elif MAXPARTICLECOUNT==1
#undef MAXPARTICLECOUNT
#define MAXPARTICLECOUNT 1
#endif
#ifndef FORCE
#define FORCE 0
#elif FORCE==1
#undef FORCE
#define FORCE 1
#endif
#ifndef VELOCITYDIR
#define VELOCITYDIR 0
#elif VELOCITYDIR==1
#undef VELOCITYDIR
#define VELOCITYDIR 1
#endif
#ifndef IGNOREVEL
#define IGNOREVEL 0
#elif IGNOREVEL==1
#undef IGNOREVEL
#define IGNOREVEL 1
#endif
#ifndef NODE_67_DROPLIST_ITEM
#define NODE_67_DROPLIST_ITEM 0
#endif
#ifndef EXTERNALTIME
#define EXTERNALTIME 0
#elif EXTERNALTIME==1
#undef EXTERNALTIME
#define EXTERNALTIME 1
#endif
#ifndef WORLDPOSSEED
#define WORLDPOSSEED 0
#elif WORLDPOSSEED==1
#undef WORLDPOSSEED
#define WORLDPOSSEED 1
#endif
#ifndef LIFETIMEMINMAX
#define LIFETIMEMINMAX 0
#elif LIFETIMEMINMAX==1
#undef LIFETIMEMINMAX
#define LIFETIMEMINMAX 1
#endif
#ifndef INSTANTSPAWN
#define INSTANTSPAWN 0
#elif INSTANTSPAWN==1
#undef INSTANTSPAWN
#define INSTANTSPAWN 1
#endif
#ifndef SIZEMINMAX
#define SIZEMINMAX 0
#elif SIZEMINMAX==1
#undef SIZEMINMAX
#define SIZEMINMAX 1
#endif
#ifndef SIZERAMP
#define SIZERAMP 0
#elif SIZERAMP==1
#undef SIZERAMP
#define SIZERAMP 1
#endif
#ifndef SC_USE_UV_TRANSFORM_sizeRampTexture
#define SC_USE_UV_TRANSFORM_sizeRampTexture 0
#elif SC_USE_UV_TRANSFORM_sizeRampTexture==1
#undef SC_USE_UV_TRANSFORM_sizeRampTexture
#define SC_USE_UV_TRANSFORM_sizeRampTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_sizeRampTexture
#define SC_SOFTWARE_WRAP_MODE_U_sizeRampTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_sizeRampTexture
#define SC_SOFTWARE_WRAP_MODE_V_sizeRampTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_sizeRampTexture
#define SC_USE_UV_MIN_MAX_sizeRampTexture 0
#elif SC_USE_UV_MIN_MAX_sizeRampTexture==1
#undef SC_USE_UV_MIN_MAX_sizeRampTexture
#define SC_USE_UV_MIN_MAX_sizeRampTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_sizeRampTexture
#define SC_USE_CLAMP_TO_BORDER_sizeRampTexture 0
#elif SC_USE_CLAMP_TO_BORDER_sizeRampTexture==1
#undef SC_USE_CLAMP_TO_BORDER_sizeRampTexture
#define SC_USE_CLAMP_TO_BORDER_sizeRampTexture 1
#endif
#ifndef INILOCATION
#define INILOCATION 0
#elif INILOCATION==1
#undef INILOCATION
#define INILOCATION 1
#endif
#ifndef BOXSPAWN
#define BOXSPAWN 0
#elif BOXSPAWN==1
#undef BOXSPAWN
#define BOXSPAWN 1
#endif
#ifndef SPHERESPAWN
#define SPHERESPAWN 0
#elif SPHERESPAWN==1
#undef SPHERESPAWN
#define SPHERESPAWN 1
#endif
#ifndef VELRAMP
#define VELRAMP 0
#elif VELRAMP==1
#undef VELRAMP
#define VELRAMP 1
#endif
#ifndef SC_USE_UV_TRANSFORM_velRampTexture
#define SC_USE_UV_TRANSFORM_velRampTexture 0
#elif SC_USE_UV_TRANSFORM_velRampTexture==1
#undef SC_USE_UV_TRANSFORM_velRampTexture
#define SC_USE_UV_TRANSFORM_velRampTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_velRampTexture
#define SC_SOFTWARE_WRAP_MODE_U_velRampTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_velRampTexture
#define SC_SOFTWARE_WRAP_MODE_V_velRampTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_velRampTexture
#define SC_USE_UV_MIN_MAX_velRampTexture 0
#elif SC_USE_UV_MIN_MAX_velRampTexture==1
#undef SC_USE_UV_MIN_MAX_velRampTexture
#define SC_USE_UV_MIN_MAX_velRampTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_velRampTexture
#define SC_USE_CLAMP_TO_BORDER_velRampTexture 0
#elif SC_USE_CLAMP_TO_BORDER_velRampTexture==1
#undef SC_USE_CLAMP_TO_BORDER_velRampTexture
#define SC_USE_CLAMP_TO_BORDER_velRampTexture 1
#endif
#ifndef NOISE
#define NOISE 0
#elif NOISE==1
#undef NOISE
#define NOISE 1
#endif
#ifndef SNOISE
#define SNOISE 0
#elif SNOISE==1
#undef SNOISE
#define SNOISE 1
#endif
#ifndef sc_PointLightsCount
#define sc_PointLightsCount 0
#endif
#ifndef sc_DirectionalLightsCount
#define sc_DirectionalLightsCount 0
#endif
#ifndef sc_AmbientLightsCount
#define sc_AmbientLightsCount 0
#endif
struct sc_PointLight_t
{
bool falloffEnabled;
float falloffEndDistance;
float negRcpFalloffEndDistance4;
float angleScale;
float angleOffset;
vec3 direction;
vec3 position;
vec4 color;
};
struct sc_DirectionalLight_t
{
vec3 direction;
vec4 color;
};
struct sc_AmbientLight_t
{
vec3 color;
float intensity;
};
struct sc_SphericalGaussianLight_t
{
vec3 color;
float sharpness;
vec3 axis;
};
struct sc_LightEstimationData_t
{
sc_SphericalGaussianLight_t sg[12];
vec3 ambientLight;
};
uniform vec4 sc_EnvmapDiffuseDims;
uniform vec4 sc_EnvmapSpecularDims;
uniform vec4 sc_ScreenTextureDims;
uniform mat4 sc_ModelMatrix;
uniform mat4 sc_ProjectorMatrix;
uniform vec4 sc_StereoClipPlanes[sc_NumStereoViews];
uniform vec4 sc_UniformConstants;
uniform vec4 sc_BoneMatrices[((sc_SkinBonesCount*3)+1)];
uniform mat3 sc_SkinBonesNormalMatrices[(sc_SkinBonesCount+1)];
uniform vec4 weights0;
uniform vec4 weights1;
uniform mat4 sc_ViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewMatrixArray[sc_NumStereoViews];
uniform sc_Camera_t sc_Camera;
uniform mat4 sc_ProjectionMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ViewMatrixArray[sc_NumStereoViews];
uniform float sc_DisableFrustumCullingMarker;
uniform mat4 sc_ProjectionMatrixArray[sc_NumStereoViews];
uniform mat3 sc_NormalMatrix;
uniform vec2 sc_TAAJitterOffset;
uniform vec4 intensityTextureDims;
uniform int PreviewEnabled;
uniform vec4 sizeRampTextureDims;
uniform vec4 velRampTextureDims;
uniform vec4 mainTextureDims;
uniform vec4 vectorTextureDims;
uniform vec4 colorRampTextureDims;
uniform float timeGlobal;
uniform float externalTimeInput;
uniform float externalSeed;
uniform float lifeTimeConstant;
uniform vec2 lifeTimeMinMax;
uniform float spawnDuration;
uniform float spawnMaxParticles;
uniform mat3 sizeRampTextureTransform;
uniform vec4 sizeRampTextureUvMinMax;
uniform vec4 sizeRampTextureBorderColor;
uniform vec2 sizeStart;
uniform vec2 sizeEnd;
uniform vec2 sizeStartMin;
uniform vec2 sizeStartMax;
uniform vec2 sizeEndMin;
uniform vec2 sizeEndMax;
uniform float sizeSpeed;
uniform vec3 spawnLocation;
uniform vec3 spawnBox;
uniform vec3 spawnSphere;
uniform mat3 velRampTextureTransform;
uniform vec4 velRampTextureUvMinMax;
uniform vec4 velRampTextureBorderColor;
uniform vec3 velocityMin;
uniform vec3 velocityMax;
uniform vec3 velocityDrag;
uniform vec3 noiseMult;
uniform vec3 noiseFrequency;
uniform vec3 sNoiseMult;
uniform vec3 sNoiseFrequency;
uniform float gravity;
uniform vec3 localForce;
uniform float sizeVelScale;
uniform bool ALIGNTOX;
uniform bool ALIGNTOY;
uniform bool ALIGNTOZ;
uniform vec2 rotationRandom;
uniform vec2 rotationRate;
uniform float rotationDrag;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform float overrideTimeDelta;
uniform float Port_Input1_N069;
uniform float Port_Input1_N068;
uniform sc_PointLight_t sc_PointLights[(sc_PointLightsCount+1)];
uniform sc_DirectionalLight_t sc_DirectionalLights[(sc_DirectionalLightsCount+1)];
uniform sc_AmbientLight_t sc_AmbientLights[(sc_AmbientLightsCount+1)];
uniform sc_LightEstimationData_t sc_LightEstimationData;
uniform vec4 sc_EnvmapDiffuseSize;
uniform vec4 sc_EnvmapDiffuseView;
uniform vec4 sc_EnvmapSpecularSize;
uniform vec4 sc_EnvmapSpecularView;
uniform vec3 sc_EnvmapRotation;
uniform float sc_EnvmapExposure;
uniform vec3 sc_Sh[9];
uniform float sc_ShIntensity;
uniform vec4 sc_GeometryInfo;
uniform mat4 sc_ModelViewProjectionMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ViewProjectionMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewMatrixInverseArray[sc_NumStereoViews];
uniform mat3 sc_ViewNormalMatrixArray[sc_NumStereoViews];
uniform mat3 sc_ViewNormalMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ViewMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ModelMatrixInverse;
uniform mat3 sc_NormalMatrixInverse;
uniform mat4 sc_PrevFrameModelMatrix;
uniform mat4 sc_PrevFrameModelMatrixInverse;
uniform vec3 sc_LocalAabbMin;
uniform vec3 sc_LocalAabbMax;
uniform vec3 sc_WorldAabbMin;
uniform vec3 sc_WorldAabbMax;
uniform vec4 sc_WindowToViewportTransform;
uniform vec4 sc_CurrentRenderTargetDims;
uniform float sc_ShadowDensity;
uniform vec4 sc_ShadowColor;
uniform float _sc_GetFramebufferColorInvalidUsageMarker;
uniform float shaderComplexityValue;
uniform vec4 weights2;
uniform int sc_FallbackInstanceID;
uniform float _sc_framebufferFetchMarker;
uniform float strandWidth;
uniform float strandTaper;
uniform vec4 sc_StrandDataMapTextureSize;
uniform float clumpInstanceCount;
uniform float clumpRadius;
uniform float clumpTipScale;
uniform float hairstyleInstanceCount;
uniform float hairstyleNoise;
uniform vec4 sc_ScreenTextureSize;
uniform vec4 sc_ScreenTextureView;
uniform float correctedIntensity;
uniform vec4 intensityTextureSize;
uniform vec4 intensityTextureView;
uniform mat3 intensityTextureTransform;
uniform vec4 intensityTextureUvMinMax;
uniform vec4 intensityTextureBorderColor;
uniform float reflBlurWidth;
uniform float reflBlurMinRough;
uniform float reflBlurMaxRough;
uniform int PreviewNodeID;
uniform float alphaTestThreshold;
uniform vec4 sizeRampTextureSize;
uniform vec4 sizeRampTextureView;
uniform vec4 velRampTextureSize;
uniform vec4 velRampTextureView;
uniform vec4 mainTextureSize;
uniform vec4 mainTextureView;
uniform mat3 mainTextureTransform;
uniform vec4 mainTextureUvMinMax;
uniform vec4 mainTextureBorderColor;
uniform float numValidFrames;
uniform vec2 gridSize;
uniform float flipBookSpeedMult;
uniform float flipBookRandomStart;
uniform vec4 vectorTextureSize;
uniform vec4 vectorTextureView;
uniform mat3 vectorTextureTransform;
uniform vec4 vectorTextureUvMinMax;
uniform vec4 vectorTextureBorderColor;
uniform float flowStrength;
uniform float flowSpeed;
uniform vec3 colorStart;
uniform vec3 colorEnd;
uniform vec3 colorMinStart;
uniform vec3 colorMinEnd;
uniform vec3 colorMaxStart;
uniform vec3 colorMaxEnd;
uniform float alphaStart;
uniform float alphaEnd;
uniform float alphaMinStart;
uniform float alphaMinEnd;
uniform float alphaMaxStart;
uniform float alphaMaxEnd;
uniform vec4 colorRampTextureSize;
uniform vec4 colorRampTextureView;
uniform mat3 colorRampTextureTransform;
uniform vec4 colorRampTextureUvMinMax;
uniform vec4 colorRampTextureBorderColor;
uniform vec4 colorRampMult;
uniform float alphaDissolveMult;
uniform sampler2D sizeRampTexture;
uniform sampler2D velRampTexture;
varying float varClipDistance;
varying float varStereoViewID;
attribute vec4 boneData;
attribute vec3 blendShape0Pos;
attribute vec3 blendShape0Normal;
attribute vec3 blendShape1Pos;
attribute vec3 blendShape1Normal;
attribute vec3 blendShape2Pos;
attribute vec3 blendShape2Normal;
attribute vec3 blendShape3Pos;
attribute vec3 blendShape4Pos;
attribute vec3 blendShape5Pos;
attribute vec4 position;
attribute vec3 normal;
attribute vec4 tangent;
attribute vec2 texture0;
attribute vec2 texture1;
varying vec3 varPos;
varying vec3 varNormal;
varying vec4 varTangent;
varying vec4 varPackedTex;
varying vec4 varScreenPos;
varying vec2 varScreenTexturePos;
varying vec2 varShadowTex;
varying float varViewSpaceDepth;
varying vec4 varColor;
attribute vec4 color;
varying vec4 PreviewVertexColor;
varying float PreviewVertexSaved;
attribute vec3 positionNext;
attribute vec3 positionPrevious;
attribute vec4 strandProperties;
void blendTargetShapeWithNormal(inout sc_Vertex_t v,vec3 position_1,vec3 normal_1,float weight)
{
vec3 l9_0=v.position.xyz+(position_1*weight);
v=sc_Vertex_t(vec4(l9_0.x,l9_0.y,l9_0.z,v.position.w),v.normal,v.tangent,v.texture0,v.texture1);
v.normal+=(normal_1*weight);
}
void sc_GetBoneMatrix(int index,out vec4 m0,out vec4 m1,out vec4 m2)
{
int l9_0=3*index;
m0=sc_BoneMatrices[l9_0];
m1=sc_BoneMatrices[l9_0+1];
m2=sc_BoneMatrices[l9_0+2];
}
vec3 skinVertexPosition(int i,vec4 v)
{
vec3 l9_0;
#if (sc_SkinBonesCount>0)
{
vec4 param_1;
vec4 param_2;
vec4 param_3;
sc_GetBoneMatrix(i,param_1,param_2,param_3);
l9_0=vec3(dot(v,param_1),dot(v,param_2),dot(v,param_3));
}
#else
{
l9_0=v.xyz;
}
#endif
return l9_0;
}
float ssPow(float A,float B)
{
float l9_0;
if (A<=0.0)
{
l9_0=0.0;
}
else
{
l9_0=pow(A,B);
}
return l9_0;
}
int sc_GetStereoViewIndex()
{
int l9_0;
#if (sc_StereoRenderingMode==0)
{
l9_0=0;
}
#else
{
l9_0=sc_StereoViewID;
}
#endif
return l9_0;
}
void sc_SoftwareWrapEarly(inout float uv,int softwareWrapMode)
{
if (softwareWrapMode==1)
{
uv=fract(uv);
}
else
{
if (softwareWrapMode==2)
{
float l9_0=fract(uv);
uv=mix(l9_0,1.0-l9_0,clamp(step(0.25,fract((uv-l9_0)*0.5)),0.0,1.0));
}
}
}
void sc_ClampUV(inout float value,float minValue,float maxValue,bool useClampToBorder,inout float clampToBorderFactor)
{
float l9_0=clamp(value,minValue,maxValue);
float l9_1=step(abs(value-l9_0),9.9999997e-06);
clampToBorderFactor*=(l9_1+((1.0-float(useClampToBorder))*(1.0-l9_1)));
value=l9_0;
}
vec2 sc_TransformUV(vec2 uv,bool useUvTransform,mat3 uvTransform)
{
if (useUvTransform)
{
uv=vec2((uvTransform*vec3(uv,1.0)).xy);
}
return uv;
}
void sc_SoftwareWrapLate(inout float uv,int softwareWrapMode,bool useClampToBorder,inout float clampToBorderFactor)
{
if ((softwareWrapMode==0)||(softwareWrapMode==3))
{
sc_ClampUV(uv,0.0,1.0,useClampToBorder,clampToBorderFactor);
}
}
vec3 sc_SamplingCoordsViewToGlobal(vec2 uv,int renderingLayout,int viewIndex)
{
vec3 l9_0;
if (renderingLayout==0)
{
l9_0=vec3(uv,0.0);
}
else
{
vec3 l9_1;
if (renderingLayout==1)
{
l9_1=vec3(uv.x,(uv.y*0.5)+(0.5-(float(viewIndex)*0.5)),0.0);
}
else
{
l9_1=vec3(uv,float(viewIndex));
}
l9_0=l9_1;
}
return l9_0;
}
float N32_sNoise(vec2 v)
{
vec2 l9_0=floor(v+vec2(dot(v,vec2(0.36602542))));
vec2 l9_1=(v-l9_0)+vec2(dot(l9_0,vec2(0.21132487)));
float l9_2=l9_1.x;
float l9_3=l9_1.y;
bvec2 l9_4=bvec2(l9_2>l9_3);
vec2 l9_5=vec2(l9_4.x ? vec2(1.0,0.0).x : vec2(0.0,1.0).x,l9_4.y ? vec2(1.0,0.0).y : vec2(0.0,1.0).y);
vec4 l9_6=l9_1.xyxy+vec4(0.21132487,0.21132487,-0.57735026,-0.57735026);
vec2 l9_7=l9_6.xy-l9_5;
vec4 l9_8=vec4(l9_7.x,l9_7.y,l9_6.z,l9_6.w);
vec2 l9_9=mod(l9_0,vec2(289.0));
vec3 l9_10=vec3(l9_9.y)+vec3(0.0,l9_5.y,1.0);
vec3 l9_11=(mod(((l9_10*34.0)+vec3(1.0))*l9_10,vec3(289.0))+vec3(l9_9.x))+vec3(0.0,l9_5.x,1.0);
vec2 l9_12=l9_7.xy;
vec2 l9_13=l9_6.zw;
vec3 l9_14=max(vec3(0.5)-vec3(dot(l9_1,l9_1),dot(l9_12,l9_12),dot(l9_13,l9_13)),vec3(0.0));
vec3 l9_15=l9_14*l9_14;
vec3 l9_16=(fract(mod(((l9_11*34.0)+vec3(1.0))*l9_11,vec3(289.0))*vec3(0.024390243))*2.0)-vec3(1.0);
vec3 l9_17=abs(l9_16)-vec3(0.5);
vec3 l9_18=l9_16-floor(l9_16+vec3(0.5));
vec3 l9_19=vec3(0.0);
l9_19.x=(l9_18.x*l9_2)+(l9_17.x*l9_3);
vec2 l9_20=(l9_18.yz*l9_8.xz)+(l9_17.yz*l9_8.yw);
return 130.0*dot((l9_15*l9_15)*(vec3(1.7928429)-(((l9_18*l9_18)+(l9_17*l9_17))*0.85373473)),vec3(l9_19.x,l9_20.x,l9_20.y));
}
mat3 N2_transposeMatrix(mat4 matrix)
{
return mat3(vec3(matrix[0].x,matrix[1].x,matrix[2].x),vec3(matrix[0].y,matrix[1].y,matrix[2].y),vec3(matrix[0].z,matrix[1].z,matrix[2].z));
}
void sc_SetClipDistancePlatform(float dstClipDistance)
{
    #if sc_StereoRenderingMode==sc_StereoRendering_InstancedClipped&&sc_StereoRendering_IsClipDistanceEnabled
        gl_ClipDistance[0]=dstClipDistance;
    #endif
}
void main()
{
PreviewVertexColor=vec4(0.5);
PreviewVertexSaved=0.0;
vec4 l9_0;
#if (sc_IsEditor&&SC_DISABLE_FRUSTUM_CULLING)
{
vec4 l9_1=position;
l9_1.x=position.x+sc_DisableFrustumCullingMarker;
l9_0=l9_1;
}
#else
{
l9_0=position;
}
#endif
vec2 l9_2;
vec2 l9_3;
vec3 l9_4;
vec3 l9_5;
vec4 l9_6;
#if (sc_VertexBlending)
{
vec2 l9_7;
vec2 l9_8;
vec3 l9_9;
vec3 l9_10;
vec4 l9_11;
#if (sc_VertexBlendingUseNormals)
{
sc_Vertex_t l9_12=sc_Vertex_t(l9_0,normal,tangent.xyz,texture0,texture1);
blendTargetShapeWithNormal(l9_12,blendShape0Pos,blendShape0Normal,weights0.x);
blendTargetShapeWithNormal(l9_12,blendShape1Pos,blendShape1Normal,weights0.y);
blendTargetShapeWithNormal(l9_12,blendShape2Pos,blendShape2Normal,weights0.z);
l9_11=l9_12.position;
l9_10=l9_12.normal;
l9_9=l9_12.tangent;
l9_8=l9_12.texture0;
l9_7=l9_12.texture1;
}
#else
{
vec3 l9_14=(((((l9_0.xyz+(blendShape0Pos*weights0.x)).xyz+(blendShape1Pos*weights0.y)).xyz+(blendShape2Pos*weights0.z)).xyz+(blendShape3Pos*weights0.w)).xyz+(blendShape4Pos*weights1.x)).xyz+(blendShape5Pos*weights1.y);
l9_11=vec4(l9_14.x,l9_14.y,l9_14.z,l9_0.w);
l9_10=normal;
l9_9=tangent.xyz;
l9_8=texture0;
l9_7=texture1;
}
#endif
l9_6=l9_11;
l9_5=l9_10;
l9_4=l9_9;
l9_3=l9_8;
l9_2=l9_7;
}
#else
{
l9_6=l9_0;
l9_5=normal;
l9_4=tangent.xyz;
l9_3=texture0;
l9_2=texture1;
}
#endif
vec3 l9_15;
vec3 l9_16;
vec4 l9_17;
#if (sc_SkinBonesCount>0)
{
vec4 l9_18;
#if (sc_SkinBonesCount>0)
{
vec4 l9_19=vec4(1.0,fract(boneData.yzw));
vec4 l9_20=l9_19;
l9_20.x=1.0-dot(l9_19.yzw,vec3(1.0));
l9_18=l9_20;
}
#else
{
l9_18=vec4(0.0);
}
#endif
int l9_21=int(boneData.x);
int l9_22=int(boneData.y);
int l9_23=int(boneData.z);
int l9_24=int(boneData.w);
vec3 l9_25=(((skinVertexPosition(l9_21,l9_6)*l9_18.x)+(skinVertexPosition(l9_22,l9_6)*l9_18.y))+(skinVertexPosition(l9_23,l9_6)*l9_18.z))+(skinVertexPosition(l9_24,l9_6)*l9_18.w);
l9_17=vec4(l9_25.x,l9_25.y,l9_25.z,l9_6.w);
l9_16=((((sc_SkinBonesNormalMatrices[l9_21]*l9_5)*l9_18.x)+((sc_SkinBonesNormalMatrices[l9_22]*l9_5)*l9_18.y))+((sc_SkinBonesNormalMatrices[l9_23]*l9_5)*l9_18.z))+((sc_SkinBonesNormalMatrices[l9_24]*l9_5)*l9_18.w);
l9_15=((((sc_SkinBonesNormalMatrices[l9_21]*l9_4)*l9_18.x)+((sc_SkinBonesNormalMatrices[l9_22]*l9_4)*l9_18.y))+((sc_SkinBonesNormalMatrices[l9_23]*l9_4)*l9_18.z))+((sc_SkinBonesNormalMatrices[l9_24]*l9_4)*l9_18.w);
}
#else
{
l9_17=l9_6;
l9_16=l9_5;
l9_15=l9_4;
}
#endif
#if (sc_RenderingSpace==3)
{
varPos=vec3(0.0);
varNormal=l9_16;
varTangent=vec4(l9_15.x,l9_15.y,l9_15.z,varTangent.w);
}
#else
{
#if (sc_RenderingSpace==4)
{
varPos=vec3(0.0);
varNormal=l9_16;
varTangent=vec4(l9_15.x,l9_15.y,l9_15.z,varTangent.w);
}
#else
{
#if (sc_RenderingSpace==2)
{
varPos=l9_17.xyz;
varNormal=l9_16;
varTangent=vec4(l9_15.x,l9_15.y,l9_15.z,varTangent.w);
}
#else
{
#if (sc_RenderingSpace==1)
{
varPos=(sc_ModelMatrix*l9_17).xyz;
varNormal=sc_NormalMatrix*l9_16;
vec3 l9_26=sc_NormalMatrix*l9_15;
varTangent=vec4(l9_26.x,l9_26.y,l9_26.z,varTangent.w);
}
#endif
}
#endif
}
#endif
}
#endif
bool l9_27=PreviewEnabled==1;
vec2 l9_28;
if (l9_27)
{
vec2 l9_29=l9_3;
l9_29.x=1.0-l9_3.x;
l9_28=l9_29;
}
else
{
l9_28=l9_3;
}
varColor=color;
float l9_30;
if (overrideTimeEnabled==1)
{
l9_30=overrideTimeElapsed;
}
else
{
l9_30=sc_Time.x;
}
vec4 l9_31=varColor;
vec3 l9_32=varNormal;
float l9_33;
#if (EXTERNALTIME)
{
l9_33=1.001;
}
#else
{
l9_33=0.001;
}
#endif
float l9_34=l9_33-0.001;
float l9_35;
#if (WORLDPOSSEED)
{
l9_35=1.001;
}
#else
{
l9_35=0.001;
}
#endif
float l9_36=l9_35-0.001;
float l9_37;
#if (LIFETIMEMINMAX)
{
l9_37=1.001;
}
#else
{
l9_37=0.001;
}
#endif
float l9_38=l9_37-0.001;
float l9_39;
#if (INSTANTSPAWN)
{
l9_39=1.001;
}
#else
{
l9_39=0.001;
}
#endif
float l9_40=l9_39-0.001;
float l9_41;
if (l9_36!=0.0)
{
l9_41=length(vec4(1.0)*sc_ModelMatrix);
}
else
{
l9_41=0.0;
}
vec2 l9_42;
if (l9_38!=0.0)
{
l9_42=lifeTimeMinMax;
}
else
{
l9_42=vec2(lifeTimeConstant);
}
float l9_43=externalSeed+l9_41;
float l9_44=l9_31.x+(l9_31.y*l9_31.z);
float l9_45;
if (l9_34!=0.0)
{
l9_45=externalTimeInput;
}
else
{
l9_45=l9_30;
}
bool l9_46=!(l9_40!=0.0);
float l9_47;
if (l9_46)
{
l9_47=fract(((l9_45*timeGlobal)*(1.0/l9_42.y))+fract((l9_44*12.12358)+l9_43))*l9_42.y;
}
else
{
l9_47=timeGlobal*l9_45;
}
float l9_48=l9_47/max(l9_42.x,0.0099999998);
float l9_49=l9_47/max(l9_42.y,0.0099999998);
float l9_50=mix(l9_48,l9_49,fract((l9_44*3.5358)+l9_43));
float l9_51=clamp(l9_50,0.0,1.0);
float l9_52;
if (l9_46)
{
float l9_53;
if (spawnDuration!=0.0)
{
float l9_54;
if ((l9_45-spawnDuration)>=l9_47)
{
l9_54=1.0;
}
else
{
l9_54=0.0;
}
l9_53=l9_54;
}
else
{
l9_53=0.0;
}
l9_52=l9_53;
}
else
{
l9_52=0.0;
}
float l9_55=l9_50+l9_52;
float l9_56;
#if (MAXPARTICLECOUNT)
{
l9_56=1.001;
}
#else
{
l9_56=0.001;
}
#endif
float l9_57=l9_56-0.001;
float l9_58;
#if (SIZEMINMAX)
{
l9_58=1.001;
}
#else
{
l9_58=0.001;
}
#endif
float l9_59=l9_58-0.001;
float l9_60;
#if (SIZERAMP)
{
l9_60=1.001;
}
#else
{
l9_60=0.001;
}
#endif
float l9_61=l9_60-0.001;
float l9_62=ssPow(l9_51,sizeSpeed);
vec2 l9_63;
vec2 l9_64;
if (l9_59!=0.0)
{
l9_64=mix(sizeEndMin,sizeEndMax,vec2(fract((l9_44*41.231232)+l9_43)-0.5));
l9_63=mix(sizeStartMin,sizeStartMax,vec2(fract((l9_44*334.59122)+l9_43)-0.5));
}
else
{
l9_64=sizeEnd;
l9_63=sizeStart;
}
vec2 l9_65=mix(l9_63,l9_64,vec2(l9_62));
vec2 l9_66;
if (l9_61!=0.0)
{
vec2 l9_67=l9_28/vec2(10000.0,1.0);
vec2 l9_68=l9_67+vec2(ceil(l9_51*10000.0)/10000.0,0.0);
int l9_69;
#if (sizeRampTextureHasSwappedViews)
{
l9_69=1-sc_GetStereoViewIndex();
}
#else
{
l9_69=sc_GetStereoViewIndex();
}
#endif
float l9_70=l9_68.x;
sc_SoftwareWrapEarly(l9_70,ivec2(SC_SOFTWARE_WRAP_MODE_U_sizeRampTexture,SC_SOFTWARE_WRAP_MODE_V_sizeRampTexture).x);
float l9_71=l9_70;
float l9_72=l9_68.y;
sc_SoftwareWrapEarly(l9_72,ivec2(SC_SOFTWARE_WRAP_MODE_U_sizeRampTexture,SC_SOFTWARE_WRAP_MODE_V_sizeRampTexture).y);
float l9_73=l9_72;
vec2 l9_74;
float l9_75;
#if (SC_USE_UV_MIN_MAX_sizeRampTexture)
{
bool l9_76;
#if (SC_USE_CLAMP_TO_BORDER_sizeRampTexture)
{
l9_76=ivec2(SC_SOFTWARE_WRAP_MODE_U_sizeRampTexture,SC_SOFTWARE_WRAP_MODE_V_sizeRampTexture).x==3;
}
#else
{
l9_76=(int(SC_USE_CLAMP_TO_BORDER_sizeRampTexture)!=0);
}
#endif
float l9_77=l9_71;
float l9_78=1.0;
sc_ClampUV(l9_77,sizeRampTextureUvMinMax.x,sizeRampTextureUvMinMax.z,l9_76,l9_78);
float l9_79=l9_77;
float l9_80=l9_78;
bool l9_81;
#if (SC_USE_CLAMP_TO_BORDER_sizeRampTexture)
{
l9_81=ivec2(SC_SOFTWARE_WRAP_MODE_U_sizeRampTexture,SC_SOFTWARE_WRAP_MODE_V_sizeRampTexture).y==3;
}
#else
{
l9_81=(int(SC_USE_CLAMP_TO_BORDER_sizeRampTexture)!=0);
}
#endif
float l9_82=l9_73;
float l9_83=l9_80;
sc_ClampUV(l9_82,sizeRampTextureUvMinMax.y,sizeRampTextureUvMinMax.w,l9_81,l9_83);
l9_75=l9_83;
l9_74=vec2(l9_79,l9_82);
}
#else
{
l9_75=1.0;
l9_74=vec2(l9_71,l9_73);
}
#endif
vec2 l9_84=sc_TransformUV(l9_74,(int(SC_USE_UV_TRANSFORM_sizeRampTexture)!=0),sizeRampTextureTransform);
float l9_85=l9_84.x;
float l9_86=l9_75;
sc_SoftwareWrapLate(l9_85,ivec2(SC_SOFTWARE_WRAP_MODE_U_sizeRampTexture,SC_SOFTWARE_WRAP_MODE_V_sizeRampTexture).x,(int(SC_USE_CLAMP_TO_BORDER_sizeRampTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_sizeRampTexture)!=0)),l9_86);
float l9_87=l9_84.y;
float l9_88=l9_86;
sc_SoftwareWrapLate(l9_87,ivec2(SC_SOFTWARE_WRAP_MODE_U_sizeRampTexture,SC_SOFTWARE_WRAP_MODE_V_sizeRampTexture).y,(int(SC_USE_CLAMP_TO_BORDER_sizeRampTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_sizeRampTexture)!=0)),l9_88);
float l9_89=l9_88;
vec3 l9_90=sc_SamplingCoordsViewToGlobal(vec2(l9_85,l9_87),sizeRampTextureLayout,l9_69);
vec4 l9_91;
#if (sc_CanUseTextureLod)
{
l9_91=texture2DLod(sizeRampTexture,l9_90.xy,0.0);
}
#else
{
l9_91=vec4(0.0);
}
#endif
vec4 l9_92;
#if (SC_USE_CLAMP_TO_BORDER_sizeRampTexture)
{
l9_92=mix(sizeRampTextureBorderColor,l9_91,vec4(l9_89));
}
#else
{
l9_92=l9_91;
}
#endif
vec2 l9_93;
#if (!((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH))
{
l9_93=vec2(1.0);
}
#else
{
l9_93=l9_92.xy;
}
#endif
l9_66=l9_93*l9_63;
}
else
{
l9_66=l9_65;
}
float l9_94;
#if (INILOCATION)
{
l9_94=1.001;
}
#else
{
l9_94=0.001;
}
#endif
float l9_95=l9_94-0.001;
float l9_96;
#if (BOXSPAWN)
{
l9_96=1.001;
}
#else
{
l9_96=0.001;
}
#endif
float l9_97=l9_96-0.001;
float l9_98;
#if (SPHERESPAWN)
{
l9_98=1.001;
}
#else
{
l9_98=0.001;
}
#endif
float l9_99=l9_98-0.001;
float l9_100=fract((l9_44*654.15588)+l9_43);
vec3 l9_101;
if (l9_95!=0.0)
{
l9_101=spawnLocation;
}
else
{
l9_101=vec3(0.0);
}
vec3 l9_102;
if (l9_97!=0.0)
{
l9_102=spawnBox*(fract((vec3(fract((l9_44*82.124229)+l9_43),fract((l9_44*9115.2148)+l9_43),l9_100)*313.13324)+vec3(l9_43))-vec3(0.5));
}
else
{
l9_102=vec3(0.0);
}
vec3 l9_103;
if (l9_99!=0.0)
{
l9_103=spawnSphere*(vec3(l9_31.xyz)-vec3(0.5));
}
else
{
l9_103=vec3(0.0);
}
vec3 l9_104=l9_101+l9_103;
vec3 l9_105=l9_104+l9_102;
float l9_106;
#if (VELRAMP)
{
l9_106=1.001;
}
#else
{
l9_106=0.001;
}
#endif
float l9_107=l9_106-0.001;
float l9_108;
#if (NOISE)
{
l9_108=1.001;
}
#else
{
l9_108=0.001;
}
#endif
float l9_109=l9_108-0.001;
float l9_110;
#if (SNOISE)
{
l9_110=1.001;
}
#else
{
l9_110=0.001;
}
#endif
float l9_111=l9_110-0.001;
float l9_112=fract((l9_44*18.984529)+l9_43);
float l9_113=fract((l9_44*45.722408)+l9_43);
vec3 l9_114=vec3(l9_100,l9_113,l9_112);
vec3 l9_115=(l9_114-vec3(0.5))*2.0;
vec3 l9_116;
if (l9_109!=0.0)
{
l9_116=vec3(0.0)+((vec3(sin(l9_51*noiseFrequency.x),sin(l9_51*noiseFrequency.y),sin(l9_51*noiseFrequency.z))*noiseMult)*l9_115);
}
else
{
l9_116=vec3(0.0);
}
vec3 l9_117;
if (l9_111!=0.0)
{
l9_117=l9_116+((vec3(N32_sNoise(vec2(l9_112*l9_47,sNoiseFrequency.x)),N32_sNoise(vec2(l9_100*l9_47,sNoiseFrequency.y)),N32_sNoise(vec2(l9_113*l9_47,sNoiseFrequency.z)))*sNoiseMult)*l9_115);
}
else
{
l9_117=l9_116;
}
bool l9_118=l9_107!=0.0;
vec3 l9_119;
if (l9_118)
{
l9_119=mix(velocityMin,velocityMax,l9_114);
}
else
{
l9_119=velocityMin+(((l9_115+vec3(1.0))/vec3(2.0))*(velocityMax-velocityMin));
}
bool l9_120=l9_47<=0.0;
float l9_121;
if (l9_120)
{
l9_121=0.0;
}
else
{
l9_121=pow(l9_47,velocityDrag.x);
}
float l9_122;
if (l9_120)
{
l9_122=0.0;
}
else
{
l9_122=pow(l9_47,velocityDrag.y);
}
float l9_123;
if (l9_120)
{
l9_123=0.0;
}
else
{
l9_123=pow(l9_47,velocityDrag.z);
}
vec3 l9_124=vec3(l9_121,l9_122,l9_123);
vec3 l9_125=l9_119+l9_117;
vec3 l9_126;
if (l9_118)
{
vec2 l9_127=l9_28/vec2(10000.0,1.0);
vec2 l9_128=l9_127+vec2(floor(l9_51*10000.0)/10000.0,0.0);
int l9_129;
#if (velRampTextureHasSwappedViews)
{
l9_129=1-sc_GetStereoViewIndex();
}
#else
{
l9_129=sc_GetStereoViewIndex();
}
#endif
float l9_130=l9_128.x;
sc_SoftwareWrapEarly(l9_130,ivec2(SC_SOFTWARE_WRAP_MODE_U_velRampTexture,SC_SOFTWARE_WRAP_MODE_V_velRampTexture).x);
float l9_131=l9_130;
float l9_132=l9_128.y;
sc_SoftwareWrapEarly(l9_132,ivec2(SC_SOFTWARE_WRAP_MODE_U_velRampTexture,SC_SOFTWARE_WRAP_MODE_V_velRampTexture).y);
float l9_133=l9_132;
vec2 l9_134;
float l9_135;
#if (SC_USE_UV_MIN_MAX_velRampTexture)
{
bool l9_136;
#if (SC_USE_CLAMP_TO_BORDER_velRampTexture)
{
l9_136=ivec2(SC_SOFTWARE_WRAP_MODE_U_velRampTexture,SC_SOFTWARE_WRAP_MODE_V_velRampTexture).x==3;
}
#else
{
l9_136=(int(SC_USE_CLAMP_TO_BORDER_velRampTexture)!=0);
}
#endif
float l9_137=l9_131;
float l9_138=1.0;
sc_ClampUV(l9_137,velRampTextureUvMinMax.x,velRampTextureUvMinMax.z,l9_136,l9_138);
float l9_139=l9_137;
float l9_140=l9_138;
bool l9_141;
#if (SC_USE_CLAMP_TO_BORDER_velRampTexture)
{
l9_141=ivec2(SC_SOFTWARE_WRAP_MODE_U_velRampTexture,SC_SOFTWARE_WRAP_MODE_V_velRampTexture).y==3;
}
#else
{
l9_141=(int(SC_USE_CLAMP_TO_BORDER_velRampTexture)!=0);
}
#endif
float l9_142=l9_133;
float l9_143=l9_140;
sc_ClampUV(l9_142,velRampTextureUvMinMax.y,velRampTextureUvMinMax.w,l9_141,l9_143);
l9_135=l9_143;
l9_134=vec2(l9_139,l9_142);
}
#else
{
l9_135=1.0;
l9_134=vec2(l9_131,l9_133);
}
#endif
vec2 l9_144=sc_TransformUV(l9_134,(int(SC_USE_UV_TRANSFORM_velRampTexture)!=0),velRampTextureTransform);
float l9_145=l9_144.x;
float l9_146=l9_135;
sc_SoftwareWrapLate(l9_145,ivec2(SC_SOFTWARE_WRAP_MODE_U_velRampTexture,SC_SOFTWARE_WRAP_MODE_V_velRampTexture).x,(int(SC_USE_CLAMP_TO_BORDER_velRampTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_velRampTexture)!=0)),l9_146);
float l9_147=l9_144.y;
float l9_148=l9_146;
sc_SoftwareWrapLate(l9_147,ivec2(SC_SOFTWARE_WRAP_MODE_U_velRampTexture,SC_SOFTWARE_WRAP_MODE_V_velRampTexture).y,(int(SC_USE_CLAMP_TO_BORDER_velRampTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_velRampTexture)!=0)),l9_148);
float l9_149=l9_148;
vec3 l9_150=sc_SamplingCoordsViewToGlobal(vec2(l9_145,l9_147),velRampTextureLayout,l9_129);
vec4 l9_151;
#if (sc_CanUseTextureLod)
{
l9_151=texture2DLod(velRampTexture,l9_150.xy,0.0);
}
#else
{
l9_151=vec4(0.0);
}
#endif
vec4 l9_152;
#if (SC_USE_CLAMP_TO_BORDER_velRampTexture)
{
l9_152=mix(velRampTextureBorderColor,l9_151,vec4(l9_149));
}
#else
{
l9_152=l9_151;
}
#endif
vec3 l9_153;
#if (!((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH))
{
l9_153=l9_119*l9_124;
}
#else
{
l9_153=l9_125*l9_152.xyz;
}
#endif
l9_126=l9_153;
}
else
{
l9_126=l9_125*l9_124;
}
float l9_154;
#if (FORCE)
{
l9_154=1.001;
}
#else
{
l9_154=0.001;
}
#endif
float l9_155=l9_154-0.001;
float l9_156;
#if (IGNOREVEL)
{
l9_156=1.001;
}
#else
{
l9_156=0.001;
}
#endif
float l9_157=l9_156-0.001;
float l9_158=fract((l9_44*15.32451)+l9_43);
float l9_159;
if (l9_57!=0.0)
{
bool l9_160=l9_55>=0.99000001;
float l9_161;
if (l9_160||(((fract((l9_44*1231.1232)+l9_43)*1000.0)+1.0)>=spawnMaxParticles))
{
l9_161=0.0;
}
else
{
float l9_162;
if (l9_160)
{
l9_162=0.0;
}
else
{
l9_162=1.0;
}
l9_161=l9_162;
}
l9_159=l9_161;
}
else
{
l9_159=1.0;
}
float l9_163=(gravity/2.0)*l9_47;
float l9_164=l9_163*l9_47;
vec3 l9_165=vec3(0.0,l9_164,0.0);
vec3 l9_166;
if (l9_155!=0.0)
{
l9_166=((localForce/vec3(2.0))*l9_47)*l9_47;
}
else
{
l9_166=vec3(0.0);
}
float l9_167=length(sc_ModelMatrix[0].xyz);
vec2 l9_168=l9_28-vec2(0.5);
vec2 l9_169=l9_168*l9_159;
vec2 l9_170=l9_169*l9_66;
vec2 l9_171=l9_170*l9_167;
vec3 l9_172=normalize(vec3(sc_ViewMatrixArray[sc_GetStereoViewIndex()][0].z,sc_ViewMatrixArray[sc_GetStereoViewIndex()][1].z,sc_ViewMatrixArray[sc_GetStereoViewIndex()][2].z+1e-06));
vec3 l9_173=normalize(cross(l9_172,vec3(0.0,-1.0,0.0)));
vec3 l9_174;
vec3 l9_175;
if (float(ALIGNTOX)!=0.0)
{
l9_175=vec3(0.0,1.0,0.0);
l9_174=vec3(0.0,0.0,1.0);
}
else
{
l9_175=normalize(cross(l9_173,l9_172));
l9_174=l9_173;
}
vec3 l9_176;
vec3 l9_177;
if (float(ALIGNTOY)!=0.0)
{
l9_177=vec3(0.0,0.0,1.0);
l9_176=vec3(1.0,0.0,0.0);
}
else
{
l9_177=l9_175;
l9_176=l9_174;
}
vec3 l9_178;
vec3 l9_179;
if (float(ALIGNTOZ)!=0.0)
{
l9_179=vec3(0.0,1.0,0.0);
l9_178=vec3(1.0,0.0,0.0);
}
else
{
l9_179=l9_177;
l9_178=l9_176;
}
float l9_180=ssPow(1.0-l9_51,rotationDrag);
float l9_181=3.1415927*(((((mix(rotationRate.x,rotationRate.y,l9_158)*l9_180)*l9_51)*2.0)+mix(rotationRandom.x,rotationRandom.y,l9_158))-0.5);
float l9_182=cos(l9_181);
float l9_183=sin(l9_181);
vec3 l9_184=l9_178*l9_182;
vec3 l9_185=l9_179*l9_183;
vec3 l9_186=l9_178*(-l9_183);
vec3 l9_187=l9_179*l9_182;
vec3 l9_188=l9_126+l9_165;
vec3 l9_189=l9_188+l9_166;
mat3 l9_190=N2_transposeMatrix(sc_ModelMatrix);
vec3 l9_191;
#if (NODE_67_DROPLIST_ITEM==2)
{
l9_191=((l9_126*N2_transposeMatrix(sc_ModelMatrix))+l9_165)+l9_166;
}
#else
{
l9_191=l9_189*l9_190;
}
#endif
vec3 l9_192;
#if (NODE_67_DROPLIST_ITEM==1)
{
l9_192=((l9_126*vec3(l9_167,length(sc_ModelMatrix[1].xyz),length(sc_ModelMatrix[2].xyz)))+l9_165)+l9_166;
}
#else
{
l9_192=l9_191;
}
#endif
vec3 l9_193;
vec3 l9_194;
float l9_195;
#if (VELOCITYDIR)
{
vec3 l9_196=l9_192+l9_165;
vec3 l9_197=l9_196+l9_166;
vec3 l9_198=normalize(l9_197+vec3(1e-06));
float l9_199=l9_47-0.0099999998;
vec3 l9_200=l9_192*l9_199;
float l9_201=l9_47+0.0099999998;
vec3 l9_202=l9_192*l9_201;
float l9_203;
if (l9_157!=0.0)
{
l9_203=sizeVelScale;
}
else
{
l9_203=length(l9_202-l9_200)*sizeVelScale;
}
l9_195=l9_203;
l9_194=l9_198;
l9_193=normalize(cross(l9_198,l9_172));
}
#else
{
l9_195=1.0;
l9_194=l9_184+l9_185;
l9_193=l9_186+l9_187;
}
#endif
vec3 l9_204=(sc_ModelMatrix*vec4(l9_105,1.0)).xyz+l9_192;
vec3 l9_205=l9_193*l9_171.x;
float l9_206=l9_171.y*l9_195;
vec3 l9_207=l9_194*l9_206;
vec3 l9_208;
vec3 l9_209;
vec3 l9_210;
if (l9_27)
{
l9_210=varTangent.xyz;
l9_209=varNormal;
l9_208=varPos;
}
else
{
l9_210=varTangent.xyz;
l9_209=l9_32;
l9_208=(l9_204+l9_205)+l9_207;
}
varPos=l9_208;
varNormal=normalize(l9_209);
vec3 l9_211=normalize(l9_210);
varTangent=vec4(l9_211.x,l9_211.y,l9_211.z,varTangent.w);
varTangent.w=tangent.w;
#if (UseViewSpaceDepthVariant&&((sc_OITDepthGatherPass||sc_OITCompositingPass)||sc_OITDepthBoundsPass))
{
vec4 l9_212;
#if (sc_RenderingSpace==3)
{
l9_212=sc_ProjectionMatrixInverseArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
vec4 l9_213;
#if (sc_RenderingSpace==2)
{
l9_213=sc_ViewMatrixArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
vec4 l9_214;
#if (sc_RenderingSpace==1)
{
l9_214=sc_ModelViewMatrixArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
l9_214=l9_17;
}
#endif
l9_213=l9_214;
}
#endif
l9_212=l9_213;
}
#endif
varViewSpaceDepth=-l9_212.z;
}
#endif
vec4 l9_215;
#if (sc_RenderingSpace==3)
{
l9_215=l9_17;
}
#else
{
vec4 l9_216;
#if (sc_RenderingSpace==4)
{
l9_216=(sc_ModelViewMatrixArray[sc_GetStereoViewIndex()]*l9_17)*vec4(1.0/sc_Camera.aspect,1.0,1.0,1.0);
}
#else
{
vec4 l9_217;
#if (sc_RenderingSpace==2)
{
l9_217=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(varPos,1.0);
}
#else
{
vec4 l9_218;
#if (sc_RenderingSpace==1)
{
l9_218=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(varPos,1.0);
}
#else
{
l9_218=vec4(0.0);
}
#endif
l9_217=l9_218;
}
#endif
l9_216=l9_217;
}
#endif
l9_215=l9_216;
}
#endif
varPackedTex=vec4(l9_28,l9_2);
#if (sc_ProjectiveShadowsReceiver)
{
vec4 l9_219;
#if (sc_RenderingSpace==1)
{
l9_219=sc_ModelMatrix*l9_17;
}
#else
{
l9_219=l9_17;
}
#endif
vec4 l9_220=sc_ProjectorMatrix*l9_219;
varShadowTex=((l9_220.xy/vec2(l9_220.w))*0.5)+vec2(0.5);
}
#endif
vec4 l9_221;
#if (sc_DepthBufferMode==1)
{
vec4 l9_222;
if (sc_ProjectionMatrixArray[sc_GetStereoViewIndex()][2].w!=0.0)
{
vec4 l9_223=l9_215;
l9_223.z=((log2(max(sc_Camera.clipPlanes.x,1.0+l9_215.w))*(2.0/log2(sc_Camera.clipPlanes.y+1.0)))-1.0)*l9_215.w;
l9_222=l9_223;
}
else
{
l9_222=l9_215;
}
l9_221=l9_222;
}
#else
{
l9_221=l9_215;
}
#endif
vec4 l9_224;
#if (sc_ShaderCacheConstant!=0)
{
vec4 l9_225=l9_221;
l9_225.x=l9_221.x+(sc_UniformConstants.x*float(sc_ShaderCacheConstant));
l9_224=l9_225;
}
#else
{
l9_224=l9_221;
}
#endif
#if (sc_StereoRenderingMode>0)
{
varStereoViewID=float(sc_StereoViewID);
}
#endif
#if (sc_StereoRenderingMode==1)
{
float l9_226=dot(l9_224,sc_StereoClipPlanes[sc_StereoViewID]);
#if (sc_StereoRendering_IsClipDistanceEnabled==1)
{
sc_SetClipDistancePlatform(l9_226);
}
#else
{
varClipDistance=l9_226;
}
#endif
}
#endif
gl_Position=l9_224;
}
#elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
#if 0
NGS_BACKEND_SHADER_FLAGS_BEGIN__
NGS_BACKEND_SHADER_FLAGS_END__
#endif
#define SC_DISABLE_FRUSTUM_CULLING
#ifdef ALIGNTOX
#undef ALIGNTOX
#endif
#ifdef ALIGNTOY
#undef ALIGNTOY
#endif
#ifdef ALIGNTOZ
#undef ALIGNTOZ
#endif
#define sc_StereoRendering_Disabled 0
#define sc_StereoRendering_InstancedClipped 1
#define sc_StereoRendering_Multiview 2
#ifdef GL_ES
    #define SC_GLES_VERSION_20 2000
    #define SC_GLES_VERSION_30 3000
    #define SC_GLES_VERSION_31 3100
    #define SC_GLES_VERSION_32 3200
#endif
#ifdef VERTEX_SHADER
    #define scOutPos(clipPosition) gl_Position=clipPosition
    #define MAIN main
#endif
#ifdef SC_ENABLE_INSTANCED_RENDERING
    #ifndef sc_EnableInstancing
        #define sc_EnableInstancing 1
    #endif
#endif
#define mod(x,y) (x-y*floor((x+1e-6)/y))
#if defined(GL_ES)&&(__VERSION__<300)&&!defined(GL_OES_standard_derivatives)
#define dFdx(A) (A)
#define dFdy(A) (A)
#define fwidth(A) (A)
#endif
#if __VERSION__<300
#define isinf(x) (x!=0.0&&x*2.0==x ? true : false)
#define isnan(x) (x>0.0||x<0.0||x==0.0 ? false : true)
#define inverse(M) M
#endif
#ifdef sc_EnableFeatureLevelES3
    #ifdef sc_EnableStereoClipDistance
        #if defined(GL_APPLE_clip_distance)
            #extension GL_APPLE_clip_distance : require
        #elif defined(GL_EXT_clip_cull_distance)
            #extension GL_EXT_clip_cull_distance : require
        #else
            #error Clip distance is requested but not supported by this device.
        #endif
    #endif
#else
    #ifdef sc_EnableStereoClipDistance
        #error Clip distance is requested but not supported by this device.
    #endif
#endif
#ifdef sc_EnableFeatureLevelES3
    #ifdef VERTEX_SHADER
        #define attribute in
        #define varying out
    #endif
    #ifdef FRAGMENT_SHADER
        #define varying in
    #endif
    #define gl_FragColor sc_FragData0
    #define texture2D texture
    #define texture2DLod textureLod
    #define texture2DLodEXT textureLod
    #define textureCubeLodEXT textureLod
    #define sc_CanUseTextureLod 1
#else
    #ifdef FRAGMENT_SHADER
        #if defined(GL_EXT_shader_texture_lod)
            #extension GL_EXT_shader_texture_lod : require
            #define sc_CanUseTextureLod 1
            #define texture2DLod texture2DLodEXT
        #endif
    #endif
#endif
#if defined(sc_EnableMultiviewStereoRendering)
    #define sc_StereoRenderingMode sc_StereoRendering_Multiview
    #define sc_NumStereoViews 2
    #extension GL_OVR_multiview2 : require
    #ifdef VERTEX_SHADER
        #ifdef sc_EnableInstancingFallback
            #define sc_GlobalInstanceID (sc_FallbackInstanceID*2+gl_InstanceID)
        #else
            #define sc_GlobalInstanceID gl_InstanceID
        #endif
        #define sc_LocalInstanceID sc_GlobalInstanceID
        #define sc_StereoViewID int(gl_ViewID_OVR)
    #endif
#elif defined(sc_EnableInstancedClippedStereoRendering)
    #ifndef sc_EnableInstancing
        #error Instanced-clipped stereo rendering requires enabled instancing.
    #endif
    #ifndef sc_EnableStereoClipDistance
        #define sc_StereoRendering_IsClipDistanceEnabled 0
    #else
        #define sc_StereoRendering_IsClipDistanceEnabled 1
    #endif
    #define sc_StereoRenderingMode sc_StereoRendering_InstancedClipped
    #define sc_NumStereoClipPlanes 1
    #define sc_NumStereoViews 2
    #ifdef VERTEX_SHADER
        #ifdef sc_EnableInstancingFallback
            #define sc_GlobalInstanceID (sc_FallbackInstanceID*2+gl_InstanceID)
        #else
            #define sc_GlobalInstanceID gl_InstanceID
        #endif
        #ifdef sc_EnableFeatureLevelES3
            #define sc_LocalInstanceID (sc_GlobalInstanceID/2)
            #define sc_StereoViewID (sc_GlobalInstanceID%2)
        #else
            #define sc_LocalInstanceID int(sc_GlobalInstanceID/2.0)
            #define sc_StereoViewID int(mod(sc_GlobalInstanceID,2.0))
        #endif
    #endif
#else
    #define sc_StereoRenderingMode sc_StereoRendering_Disabled
#endif
#ifdef VERTEX_SHADER
    #ifdef sc_EnableInstancing
        #ifdef GL_ES
            #if defined(sc_EnableFeatureLevelES2)&&!defined(GL_EXT_draw_instanced)
                #define gl_InstanceID (0)
            #endif
        #else
            #if defined(sc_EnableFeatureLevelES2)&&!defined(GL_EXT_draw_instanced)&&!defined(GL_ARB_draw_instanced)&&!defined(GL_EXT_gpu_shader4)
                #define gl_InstanceID (0)
            #endif
        #endif
        #ifdef GL_ARB_draw_instanced
            #extension GL_ARB_draw_instanced : require
            #define gl_InstanceID gl_InstanceIDARB
        #endif
        #ifdef GL_EXT_draw_instanced
            #extension GL_EXT_draw_instanced : require
            #define gl_InstanceID gl_InstanceIDEXT
        #endif
        #ifndef sc_InstanceID
            #define sc_InstanceID gl_InstanceID
        #endif
        #ifndef sc_GlobalInstanceID
            #ifdef sc_EnableInstancingFallback
                #define sc_GlobalInstanceID (sc_FallbackInstanceID)
                #define sc_LocalInstanceID (sc_FallbackInstanceID)
            #else
                #define sc_GlobalInstanceID gl_InstanceID
                #define sc_LocalInstanceID gl_InstanceID
            #endif
        #endif
    #endif
#endif
#ifdef VERTEX_SHADER
    #if (__VERSION__<300)&&!defined(GL_EXT_gpu_shader4)
        #define gl_VertexID (0)
    #endif
#endif
#ifndef GL_ES
        #extension GL_EXT_gpu_shader4 : enable
    #extension GL_ARB_shader_texture_lod : enable
    #ifndef texture2DLodEXT
        #define texture2DLodEXT texture2DLod
    #endif
    #ifndef sc_CanUseTextureLod
    #define sc_CanUseTextureLod 1
    #endif
    #define precision
    #define lowp
    #define mediump
    #define highp
    #define sc_FragmentPrecision
#endif
#ifdef sc_EnableFeatureLevelES3
    #define sc_CanUseSampler2DArray 1
#endif
#if defined(sc_EnableFeatureLevelES2)&&defined(GL_ES)
    #ifdef FRAGMENT_SHADER
        #ifdef GL_OES_standard_derivatives
            #extension GL_OES_standard_derivatives : require
            #define sc_CanUseStandardDerivatives 1
        #endif
    #endif
    #ifdef GL_EXT_texture_array
        #extension GL_EXT_texture_array : require
        #define sc_CanUseSampler2DArray 1
    #else
        #define sc_CanUseSampler2DArray 0
    #endif
#endif
#ifdef GL_ES
    #ifdef sc_FramebufferFetch
        #if defined(GL_EXT_shader_framebuffer_fetch)
            #extension GL_EXT_shader_framebuffer_fetch : require
        #elif defined(GL_ARM_shader_framebuffer_fetch)
            #extension GL_ARM_shader_framebuffer_fetch : require
        #else
            #error Framebuffer fetch is requested but not supported by this device.
        #endif
    #endif
    #ifdef GL_FRAGMENT_PRECISION_HIGH
        #define sc_FragmentPrecision highp
    #else
        #define sc_FragmentPrecision mediump
    #endif
    #ifdef FRAGMENT_SHADER
        precision highp int;
        precision highp float;
    #endif
#endif
#ifdef VERTEX_SHADER
    #ifdef sc_EnableMultiviewStereoRendering
        layout(num_views=sc_NumStereoViews) in;
    #endif
#endif
#if __VERSION__>100
    #define SC_INT_FALLBACK_FLOAT int
    #define SC_INTERPOLATION_FLAT flat
    #define SC_INTERPOLATION_CENTROID centroid
#else
    #define SC_INT_FALLBACK_FLOAT float
    #define SC_INTERPOLATION_FLAT
    #define SC_INTERPOLATION_CENTROID
#endif
#ifndef sc_NumStereoViews
    #define sc_NumStereoViews 1
#endif
#ifndef sc_CanUseSampler2DArray
    #define sc_CanUseSampler2DArray 0
#endif
    #if __VERSION__==100||defined(SCC_VALIDATION)
        #define sampler2DArray vec2
        #define sampler3D vec3
        #define samplerCube vec4
        vec4 texture3D(vec3 s,vec3 uv)                       { return vec4(0.0); }
        vec4 texture3D(vec3 s,vec3 uv,float bias)           { return vec4(0.0); }
        vec4 texture3DLod(vec3 s,vec3 uv,float bias)        { return vec4(0.0); }
        vec4 texture3DLodEXT(vec3 s,vec3 uv,float lod)      { return vec4(0.0); }
        vec4 texture2DArray(vec2 s,vec3 uv)                  { return vec4(0.0); }
        vec4 texture2DArray(vec2 s,vec3 uv,float bias)      { return vec4(0.0); }
        vec4 texture2DArrayLod(vec2 s,vec3 uv,float lod)    { return vec4(0.0); }
        vec4 texture2DArrayLodEXT(vec2 s,vec3 uv,float lod) { return vec4(0.0); }
        vec4 textureCube(vec4 s,vec3 uv)                     { return vec4(0.0); }
        vec4 textureCube(vec4 s,vec3 uv,float lod)          { return vec4(0.0); }
        vec4 textureCubeLod(vec4 s,vec3 uv,float lod)       { return vec4(0.0); }
        vec4 textureCubeLodEXT(vec4 s,vec3 uv,float lod)    { return vec4(0.0); }
        #if defined(VERTEX_SHADER)||!sc_CanUseTextureLod
            #define texture2DLod(s,uv,lod)      vec4(0.0)
            #define texture2DLodEXT(s,uv,lod)   vec4(0.0)
        #endif
    #elif __VERSION__>=300
        #define texture3D texture
        #define textureCube texture
        #define texture2DArray texture
        #define texture2DLod textureLod
        #define texture3DLod textureLod
        #define texture2DLodEXT textureLod
        #define texture3DLodEXT textureLod
        #define textureCubeLod textureLod
        #define textureCubeLodEXT textureLod
        #define texture2DArrayLod textureLod
        #define texture2DArrayLodEXT textureLod
    #endif
    #ifndef sc_TextureRenderingLayout_Regular
        #define sc_TextureRenderingLayout_Regular 0
        #define sc_TextureRenderingLayout_StereoInstancedClipped 1
        #define sc_TextureRenderingLayout_StereoMultiview 2
    #endif
    #define depthToGlobal   depthScreenToViewSpace
    #define depthToLocal    depthViewToScreenSpace
    #ifndef quantizeUV
        #define quantizeUV sc_QuantizeUV
        #define sc_platformUVFlip sc_PlatformFlipV
        #define sc_PlatformFlipUV sc_PlatformFlipV
    #endif
    #ifndef sc_texture2DLod
        #define sc_texture2DLod sc_InternalTextureLevel
        #define sc_textureLod sc_InternalTextureLevel
        #define sc_textureBias sc_InternalTextureBiasOrLevel
        #define sc_texture sc_InternalTexture
    #endif
#if sc_ExporterVersion<224
#define MAIN main
#endif
    #ifndef sc_FramebufferFetch
    #define sc_FramebufferFetch 0
    #elif sc_FramebufferFetch==1
    #undef sc_FramebufferFetch
    #define sc_FramebufferFetch 1
    #endif
    #if !defined(GL_ES)&&__VERSION__<420
        #ifdef FRAGMENT_SHADER
            #define sc_FragData0 gl_FragData[0]
            #define sc_FragData1 gl_FragData[1]
            #define sc_FragData2 gl_FragData[2]
            #define sc_FragData3 gl_FragData[3]
        #endif
        mat4 getFragData() { return mat4(vec4(0.0),vec4(0.0),vec4(0.0),vec4(0.0)); }
        #define gl_LastFragData (getFragData())
        #if sc_FramebufferFetch
            #error Framebuffer fetch is requested but not supported by this device.
        #endif
    #elif defined(sc_EnableFeatureLevelES3)
        #if sc_FragDataCount>=1
            #define sc_DeclareFragData0(StorageQualifier) layout(location=0) StorageQualifier sc_FragmentPrecision vec4 sc_FragData0
        #endif
        #if sc_FragDataCount>=2
            #define sc_DeclareFragData1(StorageQualifier) layout(location=1) StorageQualifier sc_FragmentPrecision vec4 sc_FragData1
        #endif
        #if sc_FragDataCount>=3
            #define sc_DeclareFragData2(StorageQualifier) layout(location=2) StorageQualifier sc_FragmentPrecision vec4 sc_FragData2
        #endif
        #if sc_FragDataCount>=4
            #define sc_DeclareFragData3(StorageQualifier) layout(location=3) StorageQualifier sc_FragmentPrecision vec4 sc_FragData3
        #endif
        #ifndef sc_DeclareFragData0
            #define sc_DeclareFragData0(_) const vec4 sc_FragData0=vec4(0.0)
        #endif
        #ifndef sc_DeclareFragData1
            #define sc_DeclareFragData1(_) const vec4 sc_FragData1=vec4(0.0)
        #endif
        #ifndef sc_DeclareFragData2
            #define sc_DeclareFragData2(_) const vec4 sc_FragData2=vec4(0.0)
        #endif
        #ifndef sc_DeclareFragData3
            #define sc_DeclareFragData3(_) const vec4 sc_FragData3=vec4(0.0)
        #endif
        #if sc_FramebufferFetch
            #ifdef GL_EXT_shader_framebuffer_fetch
                sc_DeclareFragData0(inout);
                sc_DeclareFragData1(inout);
                sc_DeclareFragData2(inout);
                sc_DeclareFragData3(inout);
                mediump mat4 getFragData() { return mat4(sc_FragData0,sc_FragData1,sc_FragData2,sc_FragData3); }
                #define gl_LastFragData (getFragData())
            #elif defined(GL_ARM_shader_framebuffer_fetch)
                sc_DeclareFragData0(out);
                sc_DeclareFragData1(out);
                sc_DeclareFragData2(out);
                sc_DeclareFragData3(out);
                mediump mat4 getFragData() { return mat4(gl_LastFragColorARM,vec4(0.0),vec4(0.0),vec4(0.0)); }
                #define gl_LastFragData (getFragData())
            #endif
        #else
            #ifdef sc_EnableFeatureLevelES3
                sc_DeclareFragData0(out);
                sc_DeclareFragData1(out);
                sc_DeclareFragData2(out);
                sc_DeclareFragData3(out);
                mediump mat4 getFragData() { return mat4(vec4(0.0),vec4(0.0),vec4(0.0),vec4(0.0)); }
                #define gl_LastFragData (getFragData())
            #endif
        #endif
    #elif defined(sc_EnableFeatureLevelES2)
        #define sc_FragData0 gl_FragColor
        mediump mat4 getFragData() { return mat4(vec4(0.0),vec4(0.0),vec4(0.0),vec4(0.0)); }
    #else
        #define sc_FragData0 gl_FragColor
        mediump mat4 getFragData() { return mat4(vec4(0.0),vec4(0.0),vec4(0.0),vec4(0.0)); }
    #endif
#ifndef sc_StereoRenderingMode
#define sc_StereoRenderingMode 0
#endif
#ifndef sc_ScreenTextureHasSwappedViews
#define sc_ScreenTextureHasSwappedViews 0
#elif sc_ScreenTextureHasSwappedViews==1
#undef sc_ScreenTextureHasSwappedViews
#define sc_ScreenTextureHasSwappedViews 1
#endif
#ifndef sc_ScreenTextureLayout
#define sc_ScreenTextureLayout 0
#endif
#ifndef sc_NumStereoViews
#define sc_NumStereoViews 1
#endif
#ifndef sc_BlendMode_Normal
#define sc_BlendMode_Normal 0
#elif sc_BlendMode_Normal==1
#undef sc_BlendMode_Normal
#define sc_BlendMode_Normal 1
#endif
#ifndef sc_BlendMode_AlphaToCoverage
#define sc_BlendMode_AlphaToCoverage 0
#elif sc_BlendMode_AlphaToCoverage==1
#undef sc_BlendMode_AlphaToCoverage
#define sc_BlendMode_AlphaToCoverage 1
#endif
#ifndef sc_BlendMode_PremultipliedAlphaHardware
#define sc_BlendMode_PremultipliedAlphaHardware 0
#elif sc_BlendMode_PremultipliedAlphaHardware==1
#undef sc_BlendMode_PremultipliedAlphaHardware
#define sc_BlendMode_PremultipliedAlphaHardware 1
#endif
#ifndef sc_BlendMode_PremultipliedAlphaAuto
#define sc_BlendMode_PremultipliedAlphaAuto 0
#elif sc_BlendMode_PremultipliedAlphaAuto==1
#undef sc_BlendMode_PremultipliedAlphaAuto
#define sc_BlendMode_PremultipliedAlphaAuto 1
#endif
#ifndef sc_BlendMode_PremultipliedAlpha
#define sc_BlendMode_PremultipliedAlpha 0
#elif sc_BlendMode_PremultipliedAlpha==1
#undef sc_BlendMode_PremultipliedAlpha
#define sc_BlendMode_PremultipliedAlpha 1
#endif
#ifndef sc_BlendMode_AddWithAlphaFactor
#define sc_BlendMode_AddWithAlphaFactor 0
#elif sc_BlendMode_AddWithAlphaFactor==1
#undef sc_BlendMode_AddWithAlphaFactor
#define sc_BlendMode_AddWithAlphaFactor 1
#endif
#ifndef sc_BlendMode_AlphaTest
#define sc_BlendMode_AlphaTest 0
#elif sc_BlendMode_AlphaTest==1
#undef sc_BlendMode_AlphaTest
#define sc_BlendMode_AlphaTest 1
#endif
#ifndef sc_BlendMode_Multiply
#define sc_BlendMode_Multiply 0
#elif sc_BlendMode_Multiply==1
#undef sc_BlendMode_Multiply
#define sc_BlendMode_Multiply 1
#endif
#ifndef sc_BlendMode_MultiplyOriginal
#define sc_BlendMode_MultiplyOriginal 0
#elif sc_BlendMode_MultiplyOriginal==1
#undef sc_BlendMode_MultiplyOriginal
#define sc_BlendMode_MultiplyOriginal 1
#endif
#ifndef sc_BlendMode_ColoredGlass
#define sc_BlendMode_ColoredGlass 0
#elif sc_BlendMode_ColoredGlass==1
#undef sc_BlendMode_ColoredGlass
#define sc_BlendMode_ColoredGlass 1
#endif
#ifndef sc_BlendMode_Add
#define sc_BlendMode_Add 0
#elif sc_BlendMode_Add==1
#undef sc_BlendMode_Add
#define sc_BlendMode_Add 1
#endif
#ifndef sc_BlendMode_Screen
#define sc_BlendMode_Screen 0
#elif sc_BlendMode_Screen==1
#undef sc_BlendMode_Screen
#define sc_BlendMode_Screen 1
#endif
#ifndef sc_BlendMode_Min
#define sc_BlendMode_Min 0
#elif sc_BlendMode_Min==1
#undef sc_BlendMode_Min
#define sc_BlendMode_Min 1
#endif
#ifndef sc_BlendMode_Max
#define sc_BlendMode_Max 0
#elif sc_BlendMode_Max==1
#undef sc_BlendMode_Max
#define sc_BlendMode_Max 1
#endif
#ifndef sc_StereoRendering_IsClipDistanceEnabled
#define sc_StereoRendering_IsClipDistanceEnabled 0
#endif
#ifndef sc_ShaderComplexityAnalyzer
#define sc_ShaderComplexityAnalyzer 0
#elif sc_ShaderComplexityAnalyzer==1
#undef sc_ShaderComplexityAnalyzer
#define sc_ShaderComplexityAnalyzer 1
#endif
#ifndef sc_UseFramebufferFetchMarker
#define sc_UseFramebufferFetchMarker 0
#elif sc_UseFramebufferFetchMarker==1
#undef sc_UseFramebufferFetchMarker
#define sc_UseFramebufferFetchMarker 1
#endif
#ifndef sc_FramebufferFetch
#define sc_FramebufferFetch 0
#elif sc_FramebufferFetch==1
#undef sc_FramebufferFetch
#define sc_FramebufferFetch 1
#endif
#ifndef sc_IsEditor
#define sc_IsEditor 0
#elif sc_IsEditor==1
#undef sc_IsEditor
#define sc_IsEditor 1
#endif
#ifndef sc_GetFramebufferColorInvalidUsageMarker
#define sc_GetFramebufferColorInvalidUsageMarker 0
#elif sc_GetFramebufferColorInvalidUsageMarker==1
#undef sc_GetFramebufferColorInvalidUsageMarker
#define sc_GetFramebufferColorInvalidUsageMarker 1
#endif
#ifndef sc_BlendMode_Software
#define sc_BlendMode_Software 0
#elif sc_BlendMode_Software==1
#undef sc_BlendMode_Software
#define sc_BlendMode_Software 1
#endif
#ifndef sc_MotionVectorsPass
#define sc_MotionVectorsPass 0
#elif sc_MotionVectorsPass==1
#undef sc_MotionVectorsPass
#define sc_MotionVectorsPass 1
#endif
#ifndef intensityTextureHasSwappedViews
#define intensityTextureHasSwappedViews 0
#elif intensityTextureHasSwappedViews==1
#undef intensityTextureHasSwappedViews
#define intensityTextureHasSwappedViews 1
#endif
#ifndef intensityTextureLayout
#define intensityTextureLayout 0
#endif
#ifndef BLEND_MODE_REALISTIC
#define BLEND_MODE_REALISTIC 0
#elif BLEND_MODE_REALISTIC==1
#undef BLEND_MODE_REALISTIC
#define BLEND_MODE_REALISTIC 1
#endif
#ifndef BLEND_MODE_FORGRAY
#define BLEND_MODE_FORGRAY 0
#elif BLEND_MODE_FORGRAY==1
#undef BLEND_MODE_FORGRAY
#define BLEND_MODE_FORGRAY 1
#endif
#ifndef BLEND_MODE_NOTBRIGHT
#define BLEND_MODE_NOTBRIGHT 0
#elif BLEND_MODE_NOTBRIGHT==1
#undef BLEND_MODE_NOTBRIGHT
#define BLEND_MODE_NOTBRIGHT 1
#endif
#ifndef BLEND_MODE_DIVISION
#define BLEND_MODE_DIVISION 0
#elif BLEND_MODE_DIVISION==1
#undef BLEND_MODE_DIVISION
#define BLEND_MODE_DIVISION 1
#endif
#ifndef BLEND_MODE_BRIGHT
#define BLEND_MODE_BRIGHT 0
#elif BLEND_MODE_BRIGHT==1
#undef BLEND_MODE_BRIGHT
#define BLEND_MODE_BRIGHT 1
#endif
#ifndef BLEND_MODE_INTENSE
#define BLEND_MODE_INTENSE 0
#elif BLEND_MODE_INTENSE==1
#undef BLEND_MODE_INTENSE
#define BLEND_MODE_INTENSE 1
#endif
#ifndef SC_USE_UV_TRANSFORM_intensityTexture
#define SC_USE_UV_TRANSFORM_intensityTexture 0
#elif SC_USE_UV_TRANSFORM_intensityTexture==1
#undef SC_USE_UV_TRANSFORM_intensityTexture
#define SC_USE_UV_TRANSFORM_intensityTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_intensityTexture
#define SC_SOFTWARE_WRAP_MODE_U_intensityTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_intensityTexture
#define SC_SOFTWARE_WRAP_MODE_V_intensityTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_intensityTexture
#define SC_USE_UV_MIN_MAX_intensityTexture 0
#elif SC_USE_UV_MIN_MAX_intensityTexture==1
#undef SC_USE_UV_MIN_MAX_intensityTexture
#define SC_USE_UV_MIN_MAX_intensityTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_intensityTexture
#define SC_USE_CLAMP_TO_BORDER_intensityTexture 0
#elif SC_USE_CLAMP_TO_BORDER_intensityTexture==1
#undef SC_USE_CLAMP_TO_BORDER_intensityTexture
#define SC_USE_CLAMP_TO_BORDER_intensityTexture 1
#endif
#ifndef BLEND_MODE_LIGHTEN
#define BLEND_MODE_LIGHTEN 0
#elif BLEND_MODE_LIGHTEN==1
#undef BLEND_MODE_LIGHTEN
#define BLEND_MODE_LIGHTEN 1
#endif
#ifndef BLEND_MODE_DARKEN
#define BLEND_MODE_DARKEN 0
#elif BLEND_MODE_DARKEN==1
#undef BLEND_MODE_DARKEN
#define BLEND_MODE_DARKEN 1
#endif
#ifndef BLEND_MODE_DIVIDE
#define BLEND_MODE_DIVIDE 0
#elif BLEND_MODE_DIVIDE==1
#undef BLEND_MODE_DIVIDE
#define BLEND_MODE_DIVIDE 1
#endif
#ifndef BLEND_MODE_AVERAGE
#define BLEND_MODE_AVERAGE 0
#elif BLEND_MODE_AVERAGE==1
#undef BLEND_MODE_AVERAGE
#define BLEND_MODE_AVERAGE 1
#endif
#ifndef BLEND_MODE_SUBTRACT
#define BLEND_MODE_SUBTRACT 0
#elif BLEND_MODE_SUBTRACT==1
#undef BLEND_MODE_SUBTRACT
#define BLEND_MODE_SUBTRACT 1
#endif
#ifndef BLEND_MODE_DIFFERENCE
#define BLEND_MODE_DIFFERENCE 0
#elif BLEND_MODE_DIFFERENCE==1
#undef BLEND_MODE_DIFFERENCE
#define BLEND_MODE_DIFFERENCE 1
#endif
#ifndef BLEND_MODE_NEGATION
#define BLEND_MODE_NEGATION 0
#elif BLEND_MODE_NEGATION==1
#undef BLEND_MODE_NEGATION
#define BLEND_MODE_NEGATION 1
#endif
#ifndef BLEND_MODE_EXCLUSION
#define BLEND_MODE_EXCLUSION 0
#elif BLEND_MODE_EXCLUSION==1
#undef BLEND_MODE_EXCLUSION
#define BLEND_MODE_EXCLUSION 1
#endif
#ifndef BLEND_MODE_OVERLAY
#define BLEND_MODE_OVERLAY 0
#elif BLEND_MODE_OVERLAY==1
#undef BLEND_MODE_OVERLAY
#define BLEND_MODE_OVERLAY 1
#endif
#ifndef BLEND_MODE_SOFT_LIGHT
#define BLEND_MODE_SOFT_LIGHT 0
#elif BLEND_MODE_SOFT_LIGHT==1
#undef BLEND_MODE_SOFT_LIGHT
#define BLEND_MODE_SOFT_LIGHT 1
#endif
#ifndef BLEND_MODE_HARD_LIGHT
#define BLEND_MODE_HARD_LIGHT 0
#elif BLEND_MODE_HARD_LIGHT==1
#undef BLEND_MODE_HARD_LIGHT
#define BLEND_MODE_HARD_LIGHT 1
#endif
#ifndef BLEND_MODE_COLOR_DODGE
#define BLEND_MODE_COLOR_DODGE 0
#elif BLEND_MODE_COLOR_DODGE==1
#undef BLEND_MODE_COLOR_DODGE
#define BLEND_MODE_COLOR_DODGE 1
#endif
#ifndef BLEND_MODE_COLOR_BURN
#define BLEND_MODE_COLOR_BURN 0
#elif BLEND_MODE_COLOR_BURN==1
#undef BLEND_MODE_COLOR_BURN
#define BLEND_MODE_COLOR_BURN 1
#endif
#ifndef BLEND_MODE_LINEAR_LIGHT
#define BLEND_MODE_LINEAR_LIGHT 0
#elif BLEND_MODE_LINEAR_LIGHT==1
#undef BLEND_MODE_LINEAR_LIGHT
#define BLEND_MODE_LINEAR_LIGHT 1
#endif
#ifndef BLEND_MODE_VIVID_LIGHT
#define BLEND_MODE_VIVID_LIGHT 0
#elif BLEND_MODE_VIVID_LIGHT==1
#undef BLEND_MODE_VIVID_LIGHT
#define BLEND_MODE_VIVID_LIGHT 1
#endif
#ifndef BLEND_MODE_PIN_LIGHT
#define BLEND_MODE_PIN_LIGHT 0
#elif BLEND_MODE_PIN_LIGHT==1
#undef BLEND_MODE_PIN_LIGHT
#define BLEND_MODE_PIN_LIGHT 1
#endif
#ifndef BLEND_MODE_HARD_MIX
#define BLEND_MODE_HARD_MIX 0
#elif BLEND_MODE_HARD_MIX==1
#undef BLEND_MODE_HARD_MIX
#define BLEND_MODE_HARD_MIX 1
#endif
#ifndef BLEND_MODE_HARD_REFLECT
#define BLEND_MODE_HARD_REFLECT 0
#elif BLEND_MODE_HARD_REFLECT==1
#undef BLEND_MODE_HARD_REFLECT
#define BLEND_MODE_HARD_REFLECT 1
#endif
#ifndef BLEND_MODE_HARD_GLOW
#define BLEND_MODE_HARD_GLOW 0
#elif BLEND_MODE_HARD_GLOW==1
#undef BLEND_MODE_HARD_GLOW
#define BLEND_MODE_HARD_GLOW 1
#endif
#ifndef BLEND_MODE_HARD_PHOENIX
#define BLEND_MODE_HARD_PHOENIX 0
#elif BLEND_MODE_HARD_PHOENIX==1
#undef BLEND_MODE_HARD_PHOENIX
#define BLEND_MODE_HARD_PHOENIX 1
#endif
#ifndef BLEND_MODE_HUE
#define BLEND_MODE_HUE 0
#elif BLEND_MODE_HUE==1
#undef BLEND_MODE_HUE
#define BLEND_MODE_HUE 1
#endif
#ifndef BLEND_MODE_SATURATION
#define BLEND_MODE_SATURATION 0
#elif BLEND_MODE_SATURATION==1
#undef BLEND_MODE_SATURATION
#define BLEND_MODE_SATURATION 1
#endif
#ifndef BLEND_MODE_COLOR
#define BLEND_MODE_COLOR 0
#elif BLEND_MODE_COLOR==1
#undef BLEND_MODE_COLOR
#define BLEND_MODE_COLOR 1
#endif
#ifndef BLEND_MODE_LUMINOSITY
#define BLEND_MODE_LUMINOSITY 0
#elif BLEND_MODE_LUMINOSITY==1
#undef BLEND_MODE_LUMINOSITY
#define BLEND_MODE_LUMINOSITY 1
#endif
#ifndef sc_SkinBonesCount
#define sc_SkinBonesCount 0
#endif
#ifndef UseViewSpaceDepthVariant
#define UseViewSpaceDepthVariant 1
#elif UseViewSpaceDepthVariant==1
#undef UseViewSpaceDepthVariant
#define UseViewSpaceDepthVariant 1
#endif
#ifndef sc_OITDepthGatherPass
#define sc_OITDepthGatherPass 0
#elif sc_OITDepthGatherPass==1
#undef sc_OITDepthGatherPass
#define sc_OITDepthGatherPass 1
#endif
#ifndef sc_OITCompositingPass
#define sc_OITCompositingPass 0
#elif sc_OITCompositingPass==1
#undef sc_OITCompositingPass
#define sc_OITCompositingPass 1
#endif
#ifndef sc_OITDepthBoundsPass
#define sc_OITDepthBoundsPass 0
#elif sc_OITDepthBoundsPass==1
#undef sc_OITDepthBoundsPass
#define sc_OITDepthBoundsPass 1
#endif
#ifndef sc_OITMaxLayers4Plus1
#define sc_OITMaxLayers4Plus1 0
#elif sc_OITMaxLayers4Plus1==1
#undef sc_OITMaxLayers4Plus1
#define sc_OITMaxLayers4Plus1 1
#endif
#ifndef sc_OITMaxLayersVisualizeLayerCount
#define sc_OITMaxLayersVisualizeLayerCount 0
#elif sc_OITMaxLayersVisualizeLayerCount==1
#undef sc_OITMaxLayersVisualizeLayerCount
#define sc_OITMaxLayersVisualizeLayerCount 1
#endif
#ifndef sc_OITMaxLayers8
#define sc_OITMaxLayers8 0
#elif sc_OITMaxLayers8==1
#undef sc_OITMaxLayers8
#define sc_OITMaxLayers8 1
#endif
#ifndef sc_OITFrontLayerPass
#define sc_OITFrontLayerPass 0
#elif sc_OITFrontLayerPass==1
#undef sc_OITFrontLayerPass
#define sc_OITFrontLayerPass 1
#endif
#ifndef sc_OITDepthPrepass
#define sc_OITDepthPrepass 0
#elif sc_OITDepthPrepass==1
#undef sc_OITDepthPrepass
#define sc_OITDepthPrepass 1
#endif
#ifndef SC_DEVICE_CLASS
#define SC_DEVICE_CLASS -1
#endif
#ifndef SC_GL_FRAGMENT_PRECISION_HIGH
#define SC_GL_FRAGMENT_PRECISION_HIGH 0
#elif SC_GL_FRAGMENT_PRECISION_HIGH==1
#undef SC_GL_FRAGMENT_PRECISION_HIGH
#define SC_GL_FRAGMENT_PRECISION_HIGH 1
#endif
#ifndef ENABLE_STIPPLE_PATTERN_TEST
#define ENABLE_STIPPLE_PATTERN_TEST 0
#elif ENABLE_STIPPLE_PATTERN_TEST==1
#undef ENABLE_STIPPLE_PATTERN_TEST
#define ENABLE_STIPPLE_PATTERN_TEST 1
#endif
#ifndef sc_ProjectiveShadowsCaster
#define sc_ProjectiveShadowsCaster 0
#elif sc_ProjectiveShadowsCaster==1
#undef sc_ProjectiveShadowsCaster
#define sc_ProjectiveShadowsCaster 1
#endif
#ifndef sc_RenderAlphaToColor
#define sc_RenderAlphaToColor 0
#elif sc_RenderAlphaToColor==1
#undef sc_RenderAlphaToColor
#define sc_RenderAlphaToColor 1
#endif
#ifndef sc_BlendMode_Custom
#define sc_BlendMode_Custom 0
#elif sc_BlendMode_Custom==1
#undef sc_BlendMode_Custom
#define sc_BlendMode_Custom 1
#endif
#ifndef mainTextureHasSwappedViews
#define mainTextureHasSwappedViews 0
#elif mainTextureHasSwappedViews==1
#undef mainTextureHasSwappedViews
#define mainTextureHasSwappedViews 1
#endif
#ifndef mainTextureLayout
#define mainTextureLayout 0
#endif
#ifndef vectorTextureHasSwappedViews
#define vectorTextureHasSwappedViews 0
#elif vectorTextureHasSwappedViews==1
#undef vectorTextureHasSwappedViews
#define vectorTextureHasSwappedViews 1
#endif
#ifndef vectorTextureLayout
#define vectorTextureLayout 0
#endif
#ifndef colorRampTextureHasSwappedViews
#define colorRampTextureHasSwappedViews 0
#elif colorRampTextureHasSwappedViews==1
#undef colorRampTextureHasSwappedViews
#define colorRampTextureHasSwappedViews 1
#endif
#ifndef colorRampTextureLayout
#define colorRampTextureLayout 0
#endif
#ifndef BASETEXTURE
#define BASETEXTURE 0
#elif BASETEXTURE==1
#undef BASETEXTURE
#define BASETEXTURE 1
#endif
#ifndef SC_USE_UV_TRANSFORM_mainTexture
#define SC_USE_UV_TRANSFORM_mainTexture 0
#elif SC_USE_UV_TRANSFORM_mainTexture==1
#undef SC_USE_UV_TRANSFORM_mainTexture
#define SC_USE_UV_TRANSFORM_mainTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_mainTexture
#define SC_SOFTWARE_WRAP_MODE_U_mainTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_mainTexture
#define SC_SOFTWARE_WRAP_MODE_V_mainTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_mainTexture
#define SC_USE_UV_MIN_MAX_mainTexture 0
#elif SC_USE_UV_MIN_MAX_mainTexture==1
#undef SC_USE_UV_MIN_MAX_mainTexture
#define SC_USE_UV_MIN_MAX_mainTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_mainTexture
#define SC_USE_CLAMP_TO_BORDER_mainTexture 0
#elif SC_USE_CLAMP_TO_BORDER_mainTexture==1
#undef SC_USE_CLAMP_TO_BORDER_mainTexture
#define SC_USE_CLAMP_TO_BORDER_mainTexture 1
#endif
#ifndef FLIPBOOK
#define FLIPBOOK 0
#elif FLIPBOOK==1
#undef FLIPBOOK
#define FLIPBOOK 1
#endif
#ifndef VECTORFIELD
#define VECTORFIELD 0
#elif VECTORFIELD==1
#undef VECTORFIELD
#define VECTORFIELD 1
#endif
#ifndef COLORRAMP
#define COLORRAMP 0
#elif COLORRAMP==1
#undef COLORRAMP
#define COLORRAMP 1
#endif
#ifndef ALPHADISSOLVE
#define ALPHADISSOLVE 0
#elif ALPHADISSOLVE==1
#undef ALPHADISSOLVE
#define ALPHADISSOLVE 1
#endif
#ifndef BLACKASALPHA
#define BLACKASALPHA 0
#elif BLACKASALPHA==1
#undef BLACKASALPHA
#define BLACKASALPHA 1
#endif
#ifndef PREMULTIPLIEDCOLOR
#define PREMULTIPLIEDCOLOR 0
#elif PREMULTIPLIEDCOLOR==1
#undef PREMULTIPLIEDCOLOR
#define PREMULTIPLIEDCOLOR 1
#endif
#ifndef FLIPBOOKBLEND
#define FLIPBOOKBLEND 0
#elif FLIPBOOKBLEND==1
#undef FLIPBOOKBLEND
#define FLIPBOOKBLEND 1
#endif
#ifndef FLIPBOOKBYLIFE
#define FLIPBOOKBYLIFE 0
#elif FLIPBOOKBYLIFE==1
#undef FLIPBOOKBYLIFE
#define FLIPBOOKBYLIFE 1
#endif
#ifndef SC_USE_UV_TRANSFORM_vectorTexture
#define SC_USE_UV_TRANSFORM_vectorTexture 0
#elif SC_USE_UV_TRANSFORM_vectorTexture==1
#undef SC_USE_UV_TRANSFORM_vectorTexture
#define SC_USE_UV_TRANSFORM_vectorTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_vectorTexture
#define SC_SOFTWARE_WRAP_MODE_U_vectorTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_vectorTexture
#define SC_SOFTWARE_WRAP_MODE_V_vectorTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_vectorTexture
#define SC_USE_UV_MIN_MAX_vectorTexture 0
#elif SC_USE_UV_MIN_MAX_vectorTexture==1
#undef SC_USE_UV_MIN_MAX_vectorTexture
#define SC_USE_UV_MIN_MAX_vectorTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_vectorTexture
#define SC_USE_CLAMP_TO_BORDER_vectorTexture 0
#elif SC_USE_CLAMP_TO_BORDER_vectorTexture==1
#undef SC_USE_CLAMP_TO_BORDER_vectorTexture
#define SC_USE_CLAMP_TO_BORDER_vectorTexture 1
#endif
#ifndef EXTERNALTIME
#define EXTERNALTIME 0
#elif EXTERNALTIME==1
#undef EXTERNALTIME
#define EXTERNALTIME 1
#endif
#ifndef WORLDPOSSEED
#define WORLDPOSSEED 0
#elif WORLDPOSSEED==1
#undef WORLDPOSSEED
#define WORLDPOSSEED 1
#endif
#ifndef LIFETIMEMINMAX
#define LIFETIMEMINMAX 0
#elif LIFETIMEMINMAX==1
#undef LIFETIMEMINMAX
#define LIFETIMEMINMAX 1
#endif
#ifndef INSTANTSPAWN
#define INSTANTSPAWN 0
#elif INSTANTSPAWN==1
#undef INSTANTSPAWN
#define INSTANTSPAWN 1
#endif
#ifndef COLORMINMAX
#define COLORMINMAX 0
#elif COLORMINMAX==1
#undef COLORMINMAX
#define COLORMINMAX 1
#endif
#ifndef COLORMONOMIN
#define COLORMONOMIN 0
#elif COLORMONOMIN==1
#undef COLORMONOMIN
#define COLORMONOMIN 1
#endif
#ifndef ALPHAMINMAX
#define ALPHAMINMAX 0
#elif ALPHAMINMAX==1
#undef ALPHAMINMAX
#define ALPHAMINMAX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_colorRampTexture
#define SC_USE_UV_TRANSFORM_colorRampTexture 0
#elif SC_USE_UV_TRANSFORM_colorRampTexture==1
#undef SC_USE_UV_TRANSFORM_colorRampTexture
#define SC_USE_UV_TRANSFORM_colorRampTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_colorRampTexture
#define SC_SOFTWARE_WRAP_MODE_U_colorRampTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_colorRampTexture
#define SC_SOFTWARE_WRAP_MODE_V_colorRampTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_colorRampTexture
#define SC_USE_UV_MIN_MAX_colorRampTexture 0
#elif SC_USE_UV_MIN_MAX_colorRampTexture==1
#undef SC_USE_UV_MIN_MAX_colorRampTexture
#define SC_USE_UV_MIN_MAX_colorRampTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_colorRampTexture
#define SC_USE_CLAMP_TO_BORDER_colorRampTexture 0
#elif SC_USE_CLAMP_TO_BORDER_colorRampTexture==1
#undef SC_USE_CLAMP_TO_BORDER_colorRampTexture
#define SC_USE_CLAMP_TO_BORDER_colorRampTexture 1
#endif
#ifndef NORANDOFFSET
#define NORANDOFFSET 0
#elif NORANDOFFSET==1
#undef NORANDOFFSET
#define NORANDOFFSET 1
#endif
#ifndef sc_DepthOnly
#define sc_DepthOnly 0
#elif sc_DepthOnly==1
#undef sc_DepthOnly
#define sc_DepthOnly 1
#endif
#ifndef sc_PointLightsCount
#define sc_PointLightsCount 0
#endif
#ifndef sc_DirectionalLightsCount
#define sc_DirectionalLightsCount 0
#endif
#ifndef sc_AmbientLightsCount
#define sc_AmbientLightsCount 0
#endif
struct sc_PointLight_t
{
bool falloffEnabled;
float falloffEndDistance;
float negRcpFalloffEndDistance4;
float angleScale;
float angleOffset;
vec3 direction;
vec3 position;
vec4 color;
};
struct sc_DirectionalLight_t
{
vec3 direction;
vec4 color;
};
struct sc_AmbientLight_t
{
vec3 color;
float intensity;
};
struct sc_SphericalGaussianLight_t
{
vec3 color;
float sharpness;
vec3 axis;
};
struct sc_LightEstimationData_t
{
sc_SphericalGaussianLight_t sg[12];
vec3 ambientLight;
};
struct sc_Camera_t
{
vec3 position;
float aspect;
vec2 clipPlanes;
};
uniform vec4 sc_EnvmapDiffuseDims;
uniform vec4 sc_EnvmapSpecularDims;
uniform vec4 sc_ScreenTextureDims;
uniform vec4 sc_CurrentRenderTargetDims;
uniform mat4 sc_ProjectionMatrixArray[sc_NumStereoViews];
uniform float sc_ShadowDensity;
uniform vec4 sc_ShadowColor;
uniform float shaderComplexityValue;
uniform float _sc_framebufferFetchMarker;
uniform float _sc_GetFramebufferColorInvalidUsageMarker;
uniform mat4 sc_ViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameModelMatrix;
uniform mat4 sc_ModelMatrixInverse;
uniform vec4 intensityTextureDims;
uniform float correctedIntensity;
uniform mat3 intensityTextureTransform;
uniform vec4 intensityTextureUvMinMax;
uniform vec4 intensityTextureBorderColor;
uniform float alphaTestThreshold;
uniform vec4 sizeRampTextureDims;
uniform vec4 velRampTextureDims;
uniform vec4 mainTextureDims;
uniform vec4 vectorTextureDims;
uniform vec4 colorRampTextureDims;
uniform mat3 mainTextureTransform;
uniform vec4 mainTextureUvMinMax;
uniform vec4 mainTextureBorderColor;
uniform mat3 vectorTextureTransform;
uniform vec4 vectorTextureUvMinMax;
uniform vec4 vectorTextureBorderColor;
uniform float numValidFrames;
uniform vec2 gridSize;
uniform float flipBookSpeedMult;
uniform float flipBookRandomStart;
uniform mat4 sc_ModelMatrix;
uniform float timeGlobal;
uniform float externalTimeInput;
uniform float externalSeed;
uniform float lifeTimeConstant;
uniform vec2 lifeTimeMinMax;
uniform float spawnDuration;
uniform float flowStrength;
uniform float flowSpeed;
uniform vec3 colorStart;
uniform vec3 colorEnd;
uniform vec3 colorMinStart;
uniform vec3 colorMinEnd;
uniform vec3 colorMaxStart;
uniform vec3 colorMaxEnd;
uniform float alphaStart;
uniform float alphaEnd;
uniform float alphaMinStart;
uniform float alphaMinEnd;
uniform float alphaMaxStart;
uniform float alphaMaxEnd;
uniform mat3 colorRampTextureTransform;
uniform vec4 colorRampTextureUvMinMax;
uniform vec4 colorRampTextureBorderColor;
uniform vec4 colorRampTextureSize;
uniform vec4 colorRampMult;
uniform float alphaDissolveMult;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform float overrideTimeDelta;
uniform int PreviewEnabled;
uniform sc_PointLight_t sc_PointLights[(sc_PointLightsCount+1)];
uniform sc_DirectionalLight_t sc_DirectionalLights[(sc_DirectionalLightsCount+1)];
uniform sc_AmbientLight_t sc_AmbientLights[(sc_AmbientLightsCount+1)];
uniform sc_LightEstimationData_t sc_LightEstimationData;
uniform vec4 sc_EnvmapDiffuseSize;
uniform vec4 sc_EnvmapDiffuseView;
uniform vec4 sc_EnvmapSpecularSize;
uniform vec4 sc_EnvmapSpecularView;
uniform vec3 sc_EnvmapRotation;
uniform float sc_EnvmapExposure;
uniform vec3 sc_Sh[9];
uniform float sc_ShIntensity;
uniform vec4 sc_UniformConstants;
uniform vec4 sc_GeometryInfo;
uniform mat4 sc_ModelViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewProjectionMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ViewProjectionMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewMatrixInverseArray[sc_NumStereoViews];
uniform mat3 sc_ViewNormalMatrixArray[sc_NumStereoViews];
uniform mat3 sc_ViewNormalMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ProjectionMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ViewMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ViewMatrixInverseArray[sc_NumStereoViews];
uniform mat3 sc_NormalMatrix;
uniform mat3 sc_NormalMatrixInverse;
uniform mat4 sc_PrevFrameModelMatrixInverse;
uniform vec3 sc_LocalAabbMin;
uniform vec3 sc_LocalAabbMax;
uniform vec3 sc_WorldAabbMin;
uniform vec3 sc_WorldAabbMax;
uniform vec4 sc_WindowToViewportTransform;
uniform sc_Camera_t sc_Camera;
uniform mat4 sc_ProjectorMatrix;
uniform float sc_DisableFrustumCullingMarker;
uniform vec4 sc_BoneMatrices[((sc_SkinBonesCount*3)+1)];
uniform mat3 sc_SkinBonesNormalMatrices[(sc_SkinBonesCount+1)];
uniform vec4 weights0;
uniform vec4 weights1;
uniform vec4 weights2;
uniform vec4 sc_StereoClipPlanes[sc_NumStereoViews];
uniform int sc_FallbackInstanceID;
uniform vec2 sc_TAAJitterOffset;
uniform float strandWidth;
uniform float strandTaper;
uniform vec4 sc_StrandDataMapTextureSize;
uniform float clumpInstanceCount;
uniform float clumpRadius;
uniform float clumpTipScale;
uniform float hairstyleInstanceCount;
uniform float hairstyleNoise;
uniform vec4 sc_ScreenTextureSize;
uniform vec4 sc_ScreenTextureView;
uniform vec4 intensityTextureSize;
uniform vec4 intensityTextureView;
uniform float reflBlurWidth;
uniform float reflBlurMinRough;
uniform float reflBlurMaxRough;
uniform int PreviewNodeID;
uniform float spawnMaxParticles;
uniform vec2 sizeStart;
uniform vec2 sizeEnd;
uniform vec2 sizeStartMin;
uniform vec2 sizeStartMax;
uniform vec2 sizeEndMin;
uniform vec2 sizeEndMax;
uniform float sizeSpeed;
uniform vec4 sizeRampTextureSize;
uniform vec4 sizeRampTextureView;
uniform mat3 sizeRampTextureTransform;
uniform vec4 sizeRampTextureUvMinMax;
uniform vec4 sizeRampTextureBorderColor;
uniform vec3 spawnLocation;
uniform vec3 spawnBox;
uniform vec3 spawnSphere;
uniform vec3 velocityMin;
uniform vec3 velocityMax;
uniform vec3 velocityDrag;
uniform vec4 velRampTextureSize;
uniform vec4 velRampTextureView;
uniform mat3 velRampTextureTransform;
uniform vec4 velRampTextureUvMinMax;
uniform vec4 velRampTextureBorderColor;
uniform vec3 noiseMult;
uniform vec3 noiseFrequency;
uniform vec3 sNoiseMult;
uniform vec3 sNoiseFrequency;
uniform float gravity;
uniform vec3 localForce;
uniform float sizeVelScale;
uniform bool ALIGNTOX;
uniform bool ALIGNTOY;
uniform bool ALIGNTOZ;
uniform vec2 rotationRandom;
uniform vec2 rotationRate;
uniform float rotationDrag;
uniform vec4 mainTextureSize;
uniform vec4 mainTextureView;
uniform vec4 vectorTextureSize;
uniform vec4 vectorTextureView;
uniform vec4 colorRampTextureView;
uniform float Port_Input1_N069;
uniform float Port_Input1_N068;
uniform sampler2D mainTexture;
uniform sampler2D vectorTexture;
uniform sampler2D colorRampTexture;
uniform sampler2D sc_ScreenTexture;
uniform sampler2D intensityTexture;
uniform sampler2D sc_OITFrontDepthTexture;
uniform sampler2D sc_OITDepthHigh0;
uniform sampler2D sc_OITDepthLow0;
uniform sampler2D sc_OITAlpha0;
uniform sampler2D sc_OITDepthHigh1;
uniform sampler2D sc_OITDepthLow1;
uniform sampler2D sc_OITAlpha1;
uniform sampler2D sc_OITFilteredDepthBoundsTexture;
varying float varStereoViewID;
varying vec2 varShadowTex;
varying float varClipDistance;
varying float varViewSpaceDepth;
varying vec4 PreviewVertexColor;
varying float PreviewVertexSaved;
varying vec4 varPackedTex;
varying vec4 varColor;
varying vec3 varPos;
varying vec3 varNormal;
varying vec4 varTangent;
varying vec4 varScreenPos;
varying vec2 varScreenTexturePos;
int sc_GetStereoViewIndex()
{
int l9_0;
#if (sc_StereoRenderingMode==0)
{
l9_0=0;
}
#else
{
l9_0=int(varStereoViewID);
}
#endif
return l9_0;
}
int mainTextureGetStereoViewIndex()
{
int l9_0;
#if (mainTextureHasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
void sc_SoftwareWrapEarly(inout float uv,int softwareWrapMode)
{
if (softwareWrapMode==1)
{
uv=fract(uv);
}
else
{
if (softwareWrapMode==2)
{
float l9_0=fract(uv);
uv=mix(l9_0,1.0-l9_0,clamp(step(0.25,fract((uv-l9_0)*0.5)),0.0,1.0));
}
}
}
void sc_ClampUV(inout float value,float minValue,float maxValue,bool useClampToBorder,inout float clampToBorderFactor)
{
float l9_0=clamp(value,minValue,maxValue);
float l9_1=step(abs(value-l9_0),9.9999997e-06);
clampToBorderFactor*=(l9_1+((1.0-float(useClampToBorder))*(1.0-l9_1)));
value=l9_0;
}
vec2 sc_TransformUV(vec2 uv,bool useUvTransform,mat3 uvTransform)
{
if (useUvTransform)
{
uv=vec2((uvTransform*vec3(uv,1.0)).xy);
}
return uv;
}
void sc_SoftwareWrapLate(inout float uv,int softwareWrapMode,bool useClampToBorder,inout float clampToBorderFactor)
{
if ((softwareWrapMode==0)||(softwareWrapMode==3))
{
sc_ClampUV(uv,0.0,1.0,useClampToBorder,clampToBorderFactor);
}
}
vec3 sc_SamplingCoordsViewToGlobal(vec2 uv,int renderingLayout,int viewIndex)
{
vec3 l9_0;
if (renderingLayout==0)
{
l9_0=vec3(uv,0.0);
}
else
{
vec3 l9_1;
if (renderingLayout==1)
{
l9_1=vec3(uv.x,(uv.y*0.5)+(0.5-(float(viewIndex)*0.5)),0.0);
}
else
{
l9_1=vec3(uv,float(viewIndex));
}
l9_0=l9_1;
}
return l9_0;
}
vec4 N76_mainTexture_sample(vec2 coords)
{
float l9_0=coords.x;
sc_SoftwareWrapEarly(l9_0,ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).x);
float l9_1=l9_0;
float l9_2=coords.y;
sc_SoftwareWrapEarly(l9_2,ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).y);
float l9_3=l9_2;
vec2 l9_4;
float l9_5;
#if (SC_USE_UV_MIN_MAX_mainTexture)
{
bool l9_6;
#if (SC_USE_CLAMP_TO_BORDER_mainTexture)
{
l9_6=ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).x==3;
}
#else
{
l9_6=(int(SC_USE_CLAMP_TO_BORDER_mainTexture)!=0);
}
#endif
float l9_7=l9_1;
float l9_8=1.0;
sc_ClampUV(l9_7,mainTextureUvMinMax.x,mainTextureUvMinMax.z,l9_6,l9_8);
float l9_9=l9_7;
float l9_10=l9_8;
bool l9_11;
#if (SC_USE_CLAMP_TO_BORDER_mainTexture)
{
l9_11=ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).y==3;
}
#else
{
l9_11=(int(SC_USE_CLAMP_TO_BORDER_mainTexture)!=0);
}
#endif
float l9_12=l9_3;
float l9_13=l9_10;
sc_ClampUV(l9_12,mainTextureUvMinMax.y,mainTextureUvMinMax.w,l9_11,l9_13);
l9_5=l9_13;
l9_4=vec2(l9_9,l9_12);
}
#else
{
l9_5=1.0;
l9_4=vec2(l9_1,l9_3);
}
#endif
vec2 l9_14=sc_TransformUV(l9_4,(int(SC_USE_UV_TRANSFORM_mainTexture)!=0),mainTextureTransform);
float l9_15=l9_14.x;
float l9_16=l9_5;
sc_SoftwareWrapLate(l9_15,ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).x,(int(SC_USE_CLAMP_TO_BORDER_mainTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_mainTexture)!=0)),l9_16);
float l9_17=l9_14.y;
float l9_18=l9_16;
sc_SoftwareWrapLate(l9_17,ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).y,(int(SC_USE_CLAMP_TO_BORDER_mainTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_mainTexture)!=0)),l9_18);
float l9_19=l9_18;
vec3 l9_20=sc_SamplingCoordsViewToGlobal(vec2(l9_15,l9_17),mainTextureLayout,mainTextureGetStereoViewIndex());
vec4 l9_21=texture2D(mainTexture,l9_20.xy,0.0);
vec4 l9_22;
#if (SC_USE_CLAMP_TO_BORDER_mainTexture)
{
l9_22=mix(mainTextureBorderColor,l9_21,vec4(l9_19));
}
#else
{
l9_22=l9_21;
}
#endif
return l9_22;
}
vec2 sc_SamplingCoordsGlobalToView(vec3 uvi,int renderingLayout,int viewIndex)
{
if (renderingLayout==1)
{
uvi.y=((2.0*uvi.y)+float(viewIndex))-1.0;
}
return uvi.xy;
}
vec2 sc_ScreenCoordsGlobalToView(vec2 uv)
{
vec2 l9_0;
#if (sc_StereoRenderingMode==1)
{
l9_0=sc_SamplingCoordsGlobalToView(vec3(uv,0.0),1,sc_GetStereoViewIndex());
}
#else
{
l9_0=uv;
}
#endif
return l9_0;
}
vec4 sc_readFragData0_Platform()
{
    return getFragData()[0];
}
float transformSingleColor(float original,float intMap,float target)
{
#if ((BLEND_MODE_REALISTIC||BLEND_MODE_FORGRAY)||BLEND_MODE_NOTBRIGHT)
{
return original/pow(1.0-target,intMap);
}
#else
{
#if (BLEND_MODE_DIVISION)
{
return original/(1.0-target);
}
#else
{
#if (BLEND_MODE_BRIGHT)
{
return original/pow(1.0-target,2.0-(2.0*original));
}
#endif
}
#endif
}
#endif
return 0.0;
}
vec3 RGBtoHCV(vec3 rgb)
{
vec4 l9_0;
if (rgb.y<rgb.z)
{
l9_0=vec4(rgb.zy,-1.0,0.66666669);
}
else
{
l9_0=vec4(rgb.yz,0.0,-0.33333334);
}
vec4 l9_1;
if (rgb.x<l9_0.x)
{
l9_1=vec4(l9_0.xyw,rgb.x);
}
else
{
l9_1=vec4(rgb.x,l9_0.yzx);
}
float l9_2=l9_1.x-min(l9_1.w,l9_1.y);
return vec3(abs(((l9_1.w-l9_1.y)/((6.0*l9_2)+1e-07))+l9_1.z),l9_2,l9_1.x);
}
vec3 RGBToHSL(vec3 rgb)
{
vec3 l9_0=RGBtoHCV(rgb);
float l9_1=l9_0.y;
float l9_2=l9_0.z-(l9_1*0.5);
return vec3(l9_0.x,l9_1/((1.0-abs((2.0*l9_2)-1.0))+1e-07),l9_2);
}
vec3 HUEtoRGB(float hue)
{
return clamp(vec3(abs((6.0*hue)-3.0)-1.0,2.0-abs((6.0*hue)-2.0),2.0-abs((6.0*hue)-4.0)),vec3(0.0),vec3(1.0));
}
vec3 HSLToRGB(vec3 hsl)
{
return ((HUEtoRGB(hsl.x)-vec3(0.5))*((1.0-abs((2.0*hsl.z)-1.0))*hsl.y))+vec3(hsl.z);
}
vec3 transformColor(float yValue,vec3 original,vec3 target,float weight,float intMap)
{
#if (BLEND_MODE_INTENSE)
{
return mix(original,HSLToRGB(vec3(target.x,target.y,RGBToHSL(original).z)),vec3(weight));
}
#else
{
return mix(original,clamp(vec3(transformSingleColor(yValue,intMap,target.x),transformSingleColor(yValue,intMap,target.y),transformSingleColor(yValue,intMap,target.z)),vec3(0.0),vec3(1.0)),vec3(weight));
}
#endif
}
vec3 definedBlend(vec3 a,vec3 b)
{
#if (BLEND_MODE_LIGHTEN)
{
return max(a,b);
}
#else
{
#if (BLEND_MODE_DARKEN)
{
return min(a,b);
}
#else
{
#if (BLEND_MODE_DIVIDE)
{
return b/a;
}
#else
{
#if (BLEND_MODE_AVERAGE)
{
return (a+b)*0.5;
}
#else
{
#if (BLEND_MODE_SUBTRACT)
{
return max((a+b)-vec3(1.0),vec3(0.0));
}
#else
{
#if (BLEND_MODE_DIFFERENCE)
{
return abs(a-b);
}
#else
{
#if (BLEND_MODE_NEGATION)
{
return vec3(1.0)-abs((vec3(1.0)-a)-b);
}
#else
{
#if (BLEND_MODE_EXCLUSION)
{
return (a+b)-((a*2.0)*b);
}
#else
{
#if (BLEND_MODE_OVERLAY)
{
float l9_0;
if (a.x<0.5)
{
l9_0=(2.0*a.x)*b.x;
}
else
{
l9_0=1.0-((2.0*(1.0-a.x))*(1.0-b.x));
}
float l9_1;
if (a.y<0.5)
{
l9_1=(2.0*a.y)*b.y;
}
else
{
l9_1=1.0-((2.0*(1.0-a.y))*(1.0-b.y));
}
float l9_2;
if (a.z<0.5)
{
l9_2=(2.0*a.z)*b.z;
}
else
{
l9_2=1.0-((2.0*(1.0-a.z))*(1.0-b.z));
}
return vec3(l9_0,l9_1,l9_2);
}
#else
{
#if (BLEND_MODE_SOFT_LIGHT)
{
return (((vec3(1.0)-(b*2.0))*a)*a)+((a*2.0)*b);
}
#else
{
#if (BLEND_MODE_HARD_LIGHT)
{
float l9_3;
if (b.x<0.5)
{
l9_3=(2.0*b.x)*a.x;
}
else
{
l9_3=1.0-((2.0*(1.0-b.x))*(1.0-a.x));
}
float l9_4;
if (b.y<0.5)
{
l9_4=(2.0*b.y)*a.y;
}
else
{
l9_4=1.0-((2.0*(1.0-b.y))*(1.0-a.y));
}
float l9_5;
if (b.z<0.5)
{
l9_5=(2.0*b.z)*a.z;
}
else
{
l9_5=1.0-((2.0*(1.0-b.z))*(1.0-a.z));
}
return vec3(l9_3,l9_4,l9_5);
}
#else
{
#if (BLEND_MODE_COLOR_DODGE)
{
float l9_6;
if (b.x==1.0)
{
l9_6=b.x;
}
else
{
l9_6=min(a.x/(1.0-b.x),1.0);
}
float l9_7;
if (b.y==1.0)
{
l9_7=b.y;
}
else
{
l9_7=min(a.y/(1.0-b.y),1.0);
}
float l9_8;
if (b.z==1.0)
{
l9_8=b.z;
}
else
{
l9_8=min(a.z/(1.0-b.z),1.0);
}
return vec3(l9_6,l9_7,l9_8);
}
#else
{
#if (BLEND_MODE_COLOR_BURN)
{
float l9_9;
if (b.x==0.0)
{
l9_9=b.x;
}
else
{
l9_9=max(1.0-((1.0-a.x)/b.x),0.0);
}
float l9_10;
if (b.y==0.0)
{
l9_10=b.y;
}
else
{
l9_10=max(1.0-((1.0-a.y)/b.y),0.0);
}
float l9_11;
if (b.z==0.0)
{
l9_11=b.z;
}
else
{
l9_11=max(1.0-((1.0-a.z)/b.z),0.0);
}
return vec3(l9_9,l9_10,l9_11);
}
#else
{
#if (BLEND_MODE_LINEAR_LIGHT)
{
float l9_12;
if (b.x<0.5)
{
l9_12=max((a.x+(2.0*b.x))-1.0,0.0);
}
else
{
l9_12=min(a.x+(2.0*(b.x-0.5)),1.0);
}
float l9_13;
if (b.y<0.5)
{
l9_13=max((a.y+(2.0*b.y))-1.0,0.0);
}
else
{
l9_13=min(a.y+(2.0*(b.y-0.5)),1.0);
}
float l9_14;
if (b.z<0.5)
{
l9_14=max((a.z+(2.0*b.z))-1.0,0.0);
}
else
{
l9_14=min(a.z+(2.0*(b.z-0.5)),1.0);
}
return vec3(l9_12,l9_13,l9_14);
}
#else
{
#if (BLEND_MODE_VIVID_LIGHT)
{
float l9_15;
if (b.x<0.5)
{
float l9_16;
if ((2.0*b.x)==0.0)
{
l9_16=2.0*b.x;
}
else
{
l9_16=max(1.0-((1.0-a.x)/(2.0*b.x)),0.0);
}
l9_15=l9_16;
}
else
{
float l9_17;
if ((2.0*(b.x-0.5))==1.0)
{
l9_17=2.0*(b.x-0.5);
}
else
{
l9_17=min(a.x/(1.0-(2.0*(b.x-0.5))),1.0);
}
l9_15=l9_17;
}
float l9_18;
if (b.y<0.5)
{
float l9_19;
if ((2.0*b.y)==0.0)
{
l9_19=2.0*b.y;
}
else
{
l9_19=max(1.0-((1.0-a.y)/(2.0*b.y)),0.0);
}
l9_18=l9_19;
}
else
{
float l9_20;
if ((2.0*(b.y-0.5))==1.0)
{
l9_20=2.0*(b.y-0.5);
}
else
{
l9_20=min(a.y/(1.0-(2.0*(b.y-0.5))),1.0);
}
l9_18=l9_20;
}
float l9_21;
if (b.z<0.5)
{
float l9_22;
if ((2.0*b.z)==0.0)
{
l9_22=2.0*b.z;
}
else
{
l9_22=max(1.0-((1.0-a.z)/(2.0*b.z)),0.0);
}
l9_21=l9_22;
}
else
{
float l9_23;
if ((2.0*(b.z-0.5))==1.0)
{
l9_23=2.0*(b.z-0.5);
}
else
{
l9_23=min(a.z/(1.0-(2.0*(b.z-0.5))),1.0);
}
l9_21=l9_23;
}
return vec3(l9_15,l9_18,l9_21);
}
#else
{
#if (BLEND_MODE_PIN_LIGHT)
{
float l9_24;
if (b.x<0.5)
{
l9_24=min(a.x,2.0*b.x);
}
else
{
l9_24=max(a.x,2.0*(b.x-0.5));
}
float l9_25;
if (b.y<0.5)
{
l9_25=min(a.y,2.0*b.y);
}
else
{
l9_25=max(a.y,2.0*(b.y-0.5));
}
float l9_26;
if (b.z<0.5)
{
l9_26=min(a.z,2.0*b.z);
}
else
{
l9_26=max(a.z,2.0*(b.z-0.5));
}
return vec3(l9_24,l9_25,l9_26);
}
#else
{
#if (BLEND_MODE_HARD_MIX)
{
float l9_27;
if (b.x<0.5)
{
float l9_28;
if ((2.0*b.x)==0.0)
{
l9_28=2.0*b.x;
}
else
{
l9_28=max(1.0-((1.0-a.x)/(2.0*b.x)),0.0);
}
l9_27=l9_28;
}
else
{
float l9_29;
if ((2.0*(b.x-0.5))==1.0)
{
l9_29=2.0*(b.x-0.5);
}
else
{
l9_29=min(a.x/(1.0-(2.0*(b.x-0.5))),1.0);
}
l9_27=l9_29;
}
bool l9_30=l9_27<0.5;
float l9_31;
if (b.y<0.5)
{
float l9_32;
if ((2.0*b.y)==0.0)
{
l9_32=2.0*b.y;
}
else
{
l9_32=max(1.0-((1.0-a.y)/(2.0*b.y)),0.0);
}
l9_31=l9_32;
}
else
{
float l9_33;
if ((2.0*(b.y-0.5))==1.0)
{
l9_33=2.0*(b.y-0.5);
}
else
{
l9_33=min(a.y/(1.0-(2.0*(b.y-0.5))),1.0);
}
l9_31=l9_33;
}
bool l9_34=l9_31<0.5;
float l9_35;
if (b.z<0.5)
{
float l9_36;
if ((2.0*b.z)==0.0)
{
l9_36=2.0*b.z;
}
else
{
l9_36=max(1.0-((1.0-a.z)/(2.0*b.z)),0.0);
}
l9_35=l9_36;
}
else
{
float l9_37;
if ((2.0*(b.z-0.5))==1.0)
{
l9_37=2.0*(b.z-0.5);
}
else
{
l9_37=min(a.z/(1.0-(2.0*(b.z-0.5))),1.0);
}
l9_35=l9_37;
}
return vec3(l9_30 ? 0.0 : 1.0,l9_34 ? 0.0 : 1.0,(l9_35<0.5) ? 0.0 : 1.0);
}
#else
{
#if (BLEND_MODE_HARD_REFLECT)
{
float l9_38;
if (b.x==1.0)
{
l9_38=b.x;
}
else
{
l9_38=min((a.x*a.x)/(1.0-b.x),1.0);
}
float l9_39;
if (b.y==1.0)
{
l9_39=b.y;
}
else
{
l9_39=min((a.y*a.y)/(1.0-b.y),1.0);
}
float l9_40;
if (b.z==1.0)
{
l9_40=b.z;
}
else
{
l9_40=min((a.z*a.z)/(1.0-b.z),1.0);
}
return vec3(l9_38,l9_39,l9_40);
}
#else
{
#if (BLEND_MODE_HARD_GLOW)
{
float l9_41;
if (a.x==1.0)
{
l9_41=a.x;
}
else
{
l9_41=min((b.x*b.x)/(1.0-a.x),1.0);
}
float l9_42;
if (a.y==1.0)
{
l9_42=a.y;
}
else
{
l9_42=min((b.y*b.y)/(1.0-a.y),1.0);
}
float l9_43;
if (a.z==1.0)
{
l9_43=a.z;
}
else
{
l9_43=min((b.z*b.z)/(1.0-a.z),1.0);
}
return vec3(l9_41,l9_42,l9_43);
}
#else
{
#if (BLEND_MODE_HARD_PHOENIX)
{
return (min(a,b)-max(a,b))+vec3(1.0);
}
#else
{
#if (BLEND_MODE_HUE)
{
return HSLToRGB(vec3(RGBToHSL(b).x,RGBToHSL(a).yz));
}
#else
{
#if (BLEND_MODE_SATURATION)
{
vec3 l9_44=RGBToHSL(a);
return HSLToRGB(vec3(l9_44.x,RGBToHSL(b).y,l9_44.z));
}
#else
{
#if (BLEND_MODE_COLOR)
{
return HSLToRGB(vec3(RGBToHSL(b).xy,RGBToHSL(a).z));
}
#else
{
#if (BLEND_MODE_LUMINOSITY)
{
return HSLToRGB(vec3(RGBToHSL(a).xy,RGBToHSL(b).z));
}
#else
{
vec3 l9_45=a;
vec3 l9_46=b;
float l9_47=((0.29899999*l9_45.x)+(0.58700001*l9_45.y))+(0.114*l9_45.z);
int l9_48;
#if (intensityTextureHasSwappedViews)
{
l9_48=1-sc_GetStereoViewIndex();
}
#else
{
l9_48=sc_GetStereoViewIndex();
}
#endif
float l9_49=pow(l9_47,1.0/correctedIntensity);
sc_SoftwareWrapEarly(l9_49,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x);
float l9_50=l9_49;
float l9_51=0.5;
sc_SoftwareWrapEarly(l9_51,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y);
float l9_52=l9_51;
vec2 l9_53;
float l9_54;
#if (SC_USE_UV_MIN_MAX_intensityTexture)
{
bool l9_55;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_55=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x==3;
}
#else
{
l9_55=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_56=l9_50;
float l9_57=1.0;
sc_ClampUV(l9_56,intensityTextureUvMinMax.x,intensityTextureUvMinMax.z,l9_55,l9_57);
float l9_58=l9_56;
float l9_59=l9_57;
bool l9_60;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_60=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y==3;
}
#else
{
l9_60=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_61=l9_52;
float l9_62=l9_59;
sc_ClampUV(l9_61,intensityTextureUvMinMax.y,intensityTextureUvMinMax.w,l9_60,l9_62);
l9_54=l9_62;
l9_53=vec2(l9_58,l9_61);
}
#else
{
l9_54=1.0;
l9_53=vec2(l9_50,l9_52);
}
#endif
vec2 l9_63=sc_TransformUV(l9_53,(int(SC_USE_UV_TRANSFORM_intensityTexture)!=0),intensityTextureTransform);
float l9_64=l9_63.x;
float l9_65=l9_54;
sc_SoftwareWrapLate(l9_64,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x,(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_intensityTexture)!=0)),l9_65);
float l9_66=l9_63.y;
float l9_67=l9_65;
sc_SoftwareWrapLate(l9_66,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y,(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_intensityTexture)!=0)),l9_67);
float l9_68=l9_67;
vec3 l9_69=sc_SamplingCoordsViewToGlobal(vec2(l9_64,l9_66),intensityTextureLayout,l9_48);
vec4 l9_70=texture2D(intensityTexture,l9_69.xy,0.0);
vec4 l9_71;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_71=mix(intensityTextureBorderColor,l9_70,vec4(l9_68));
}
#else
{
l9_71=l9_70;
}
#endif
float l9_72=((((l9_71.x*256.0)+l9_71.y)+(l9_71.z/256.0))/257.00391)*16.0;
float l9_73;
#if (BLEND_MODE_FORGRAY)
{
l9_73=max(l9_72,1.0);
}
#else
{
l9_73=l9_72;
}
#endif
float l9_74;
#if (BLEND_MODE_NOTBRIGHT)
{
l9_74=min(l9_73,1.0);
}
#else
{
l9_74=l9_73;
}
#endif
return transformColor(l9_47,l9_45,l9_46,1.0,l9_74);
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
vec4 outputMotionVectorsIfNeeded(vec3 surfacePosWorldSpace,vec4 finalColor)
{
#if (sc_MotionVectorsPass)
{
vec4 l9_0=vec4(surfacePosWorldSpace,1.0);
vec4 l9_1=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*l9_0;
vec4 l9_2=((sc_PrevFrameViewProjectionMatrixArray[sc_GetStereoViewIndex()]*sc_PrevFrameModelMatrix)*sc_ModelMatrixInverse)*l9_0;
vec2 l9_3=((l9_1.xy/vec2(l9_1.w)).xy-(l9_2.xy/vec2(l9_2.w)).xy)*0.5;
float l9_4=floor(((l9_3.x*5.0)+0.5)*65535.0);
float l9_5=floor(l9_4*0.00390625);
float l9_6=floor(((l9_3.y*5.0)+0.5)*65535.0);
float l9_7=floor(l9_6*0.00390625);
return vec4(l9_5/255.0,(l9_4-(l9_5*256.0))/255.0,l9_7/255.0,(l9_6-(l9_7*256.0))/255.0);
}
#else
{
return finalColor;
}
#endif
}
void sc_writeFragData0(vec4 col)
{
    col.x+=sc_UniformConstants.x*float(sc_ShaderCacheConstant);
    sc_FragData0=col;
}
float getFrontLayerZTestEpsilon()
{
#if (sc_SkinBonesCount>0)
{
return 5e-07;
}
#else
{
return 5.0000001e-08;
}
#endif
}
void unpackValues(float channel,int passIndex,inout int values[8])
{
#if (sc_OITCompositingPass)
{
channel=floor((channel*255.0)+0.5);
int l9_0=((passIndex+1)*4)-1;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_0>=(passIndex*4))
{
values[l9_0]=(values[l9_0]*4)+int(floor(mod(channel,4.0)));
channel=floor(channel/4.0);
l9_0--;
continue;
}
else
{
break;
}
}
}
#endif
}
float getDepthOrderingEpsilon()
{
#if (sc_SkinBonesCount>0)
{
return 0.001;
}
#else
{
return 0.0;
}
#endif
}
int encodeDepth(float depth,vec2 depthBounds)
{
float l9_0=(1.0-depthBounds.x)*1000.0;
return int(clamp((depth-l9_0)/((depthBounds.y*1000.0)-l9_0),0.0,1.0)*65535.0);
}
float viewSpaceDepth()
{
#if (UseViewSpaceDepthVariant&&((sc_OITDepthGatherPass||sc_OITCompositingPass)||sc_OITDepthBoundsPass))
{
return varViewSpaceDepth;
}
#else
{
return sc_ProjectionMatrixArray[sc_GetStereoViewIndex()][3].z/(sc_ProjectionMatrixArray[sc_GetStereoViewIndex()][2].z+((gl_FragCoord.z*2.0)-1.0));
}
#endif
}
float packValue(inout int value)
{
#if (sc_OITDepthGatherPass)
{
int l9_0=value;
value/=4;
return floor(floor(mod(float(l9_0),4.0))*64.0)/255.0;
}
#else
{
return 0.0;
}
#endif
}
void sc_writeFragData1(vec4 col)
{
#if sc_FragDataCount>=2
    sc_FragData1=col;
#endif
}
void sc_writeFragData2(vec4 col)
{
#if sc_FragDataCount>=3
    sc_FragData2=col;
#endif
}
void main()
{
#if (sc_DepthOnly)
{
return;
}
#endif
#if ((sc_StereoRenderingMode==1)&&(sc_StereoRendering_IsClipDistanceEnabled==0))
{
if (varClipDistance<0.0)
{
discard;
}
}
#endif
float l9_0;
if (overrideTimeEnabled==1)
{
l9_0=overrideTimeElapsed;
}
else
{
l9_0=sc_Time.x;
}
float l9_1;
#if (BASETEXTURE)
{
l9_1=1.001;
}
#else
{
l9_1=0.001;
}
#endif
float l9_2=l9_1-0.001;
float l9_3;
#if (FLIPBOOK)
{
l9_3=1.001;
}
#else
{
l9_3=0.001;
}
#endif
float l9_4=l9_3-0.001;
float l9_5;
#if (EXTERNALTIME)
{
l9_5=1.001;
}
#else
{
l9_5=0.001;
}
#endif
float l9_6=l9_5-0.001;
float l9_7;
#if (WORLDPOSSEED)
{
l9_7=1.001;
}
#else
{
l9_7=0.001;
}
#endif
float l9_8=l9_7-0.001;
float l9_9;
#if (LIFETIMEMINMAX)
{
l9_9=1.001;
}
#else
{
l9_9=0.001;
}
#endif
float l9_10=l9_9-0.001;
float l9_11;
#if (INSTANTSPAWN)
{
l9_11=1.001;
}
#else
{
l9_11=0.001;
}
#endif
float l9_12=l9_11-0.001;
float l9_13;
if (l9_8!=0.0)
{
l9_13=length(vec4(1.0)*sc_ModelMatrix);
}
else
{
l9_13=0.0;
}
vec2 l9_14;
if (l9_10!=0.0)
{
l9_14=lifeTimeMinMax;
}
else
{
l9_14=vec2(lifeTimeConstant);
}
float l9_15=max(l9_14.x,0.0099999998);
float l9_16=max(l9_14.y,0.0099999998);
float l9_17=externalSeed+l9_13;
float l9_18=varColor.x+(varColor.y*varColor.z);
float l9_19=fract((l9_18*3.5358)+l9_17);
float l9_20;
if (l9_6!=0.0)
{
l9_20=externalTimeInput;
}
else
{
l9_20=l9_0;
}
float l9_21;
if (!(l9_12!=0.0))
{
l9_21=fract(((l9_20*timeGlobal)*(1.0/l9_14.y))+fract((l9_18*12.12358)+l9_17))*l9_14.y;
}
else
{
l9_21=timeGlobal*l9_20;
}
float l9_22=l9_21/l9_15;
float l9_23=l9_21/l9_16;
float l9_24=clamp(mix(l9_22,l9_23,l9_19),0.0,1.0);
float l9_25;
#if (FLIPBOOKBLEND)
{
l9_25=1.001;
}
#else
{
l9_25=0.001;
}
#endif
float l9_26=l9_25-0.001;
float l9_27;
#if (FLIPBOOKBYLIFE)
{
l9_27=1.001;
}
#else
{
l9_27=0.001;
}
#endif
float l9_28;
if ((l9_27-0.001)!=0.0)
{
l9_28=l9_21/mix(l9_15,l9_16,l9_19);
}
else
{
l9_28=l9_21;
}
vec2 l9_29=varPackedTex.xy/gridSize;
float l9_30=l9_28*flipBookSpeedMult;
float l9_31=mod(l9_30+mix(0.0,flipBookRandomStart,fract((l9_18*43.2234)+l9_17)),numValidFrames);
float l9_32=1.0/gridSize.x;
float l9_33=1.0/gridSize.y;
float l9_34=mod(l9_31+1.0,numValidFrames);
vec2 l9_35=l9_29+vec2(floor(l9_31)*l9_32,mod(floor((-l9_31)/gridSize.x),gridSize.y)*l9_33);
vec4 l9_36;
if (l9_26!=0.0)
{
l9_36=mix(N76_mainTexture_sample(l9_35),N76_mainTexture_sample(l9_29+vec2(floor(l9_34)*l9_32,floor((-l9_34)*l9_32)*l9_33)),vec4(fract(l9_31)));
}
else
{
l9_36=N76_mainTexture_sample(l9_35);
}
vec4 l9_37;
#if (!((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH))
{
l9_37=N76_mainTexture_sample(varPackedTex.xy);
}
#else
{
int l9_38;
#if (vectorTextureHasSwappedViews)
{
l9_38=1-sc_GetStereoViewIndex();
}
#else
{
l9_38=sc_GetStereoViewIndex();
}
#endif
float l9_39=varPackedTex.x;
sc_SoftwareWrapEarly(l9_39,ivec2(SC_SOFTWARE_WRAP_MODE_U_vectorTexture,SC_SOFTWARE_WRAP_MODE_V_vectorTexture).x);
float l9_40=l9_39;
float l9_41=varPackedTex.y;
sc_SoftwareWrapEarly(l9_41,ivec2(SC_SOFTWARE_WRAP_MODE_U_vectorTexture,SC_SOFTWARE_WRAP_MODE_V_vectorTexture).y);
float l9_42=l9_41;
vec2 l9_43;
float l9_44;
#if (SC_USE_UV_MIN_MAX_vectorTexture)
{
bool l9_45;
#if (SC_USE_CLAMP_TO_BORDER_vectorTexture)
{
l9_45=ivec2(SC_SOFTWARE_WRAP_MODE_U_vectorTexture,SC_SOFTWARE_WRAP_MODE_V_vectorTexture).x==3;
}
#else
{
l9_45=(int(SC_USE_CLAMP_TO_BORDER_vectorTexture)!=0);
}
#endif
float l9_46=l9_40;
float l9_47=1.0;
sc_ClampUV(l9_46,vectorTextureUvMinMax.x,vectorTextureUvMinMax.z,l9_45,l9_47);
float l9_48=l9_46;
float l9_49=l9_47;
bool l9_50;
#if (SC_USE_CLAMP_TO_BORDER_vectorTexture)
{
l9_50=ivec2(SC_SOFTWARE_WRAP_MODE_U_vectorTexture,SC_SOFTWARE_WRAP_MODE_V_vectorTexture).y==3;
}
#else
{
l9_50=(int(SC_USE_CLAMP_TO_BORDER_vectorTexture)!=0);
}
#endif
float l9_51=l9_42;
float l9_52=l9_49;
sc_ClampUV(l9_51,vectorTextureUvMinMax.y,vectorTextureUvMinMax.w,l9_50,l9_52);
l9_44=l9_52;
l9_43=vec2(l9_48,l9_51);
}
#else
{
l9_44=1.0;
l9_43=vec2(l9_40,l9_42);
}
#endif
vec2 l9_53=sc_TransformUV(l9_43,(int(SC_USE_UV_TRANSFORM_vectorTexture)!=0),vectorTextureTransform);
float l9_54=l9_53.x;
float l9_55=l9_44;
sc_SoftwareWrapLate(l9_54,ivec2(SC_SOFTWARE_WRAP_MODE_U_vectorTexture,SC_SOFTWARE_WRAP_MODE_V_vectorTexture).x,(int(SC_USE_CLAMP_TO_BORDER_vectorTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_vectorTexture)!=0)),l9_55);
float l9_56=l9_53.y;
float l9_57=l9_55;
sc_SoftwareWrapLate(l9_56,ivec2(SC_SOFTWARE_WRAP_MODE_U_vectorTexture,SC_SOFTWARE_WRAP_MODE_V_vectorTexture).y,(int(SC_USE_CLAMP_TO_BORDER_vectorTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_vectorTexture)!=0)),l9_57);
float l9_58=l9_57;
vec3 l9_59=sc_SamplingCoordsViewToGlobal(vec2(l9_54,l9_56),vectorTextureLayout,l9_38);
vec4 l9_60=texture2D(vectorTexture,l9_59.xy,0.0);
vec4 l9_61;
#if (SC_USE_CLAMP_TO_BORDER_vectorTexture)
{
l9_61=mix(vectorTextureBorderColor,l9_60,vec4(l9_58));
}
#else
{
l9_61=l9_60;
}
#endif
float l9_62=l9_0*flowSpeed;
float l9_63=fract(l9_62+0.5);
vec2 l9_64=((l9_61-vec4(0.5))*2.0).xy;
l9_37=mix(N76_mainTexture_sample(varPackedTex.xy+((l9_64*l9_63)*flowStrength)),N76_mainTexture_sample(varPackedTex.xy+((l9_64*fract(l9_62+1.0))*flowStrength)),vec4(abs((0.5-l9_63)/0.5)));
}
#endif
float l9_65;
#if (VECTORFIELD)
{
l9_65=1.001;
}
#else
{
l9_65=0.001;
}
#endif
float l9_66=l9_65-0.001;
float l9_67;
#if (COLORMINMAX)
{
l9_67=1.001;
}
#else
{
l9_67=0.001;
}
#endif
float l9_68=l9_67-0.001;
float l9_69;
#if (COLORMONOMIN)
{
l9_69=1.001;
}
#else
{
l9_69=0.001;
}
#endif
float l9_70=l9_69-0.001;
float l9_71;
#if (ALPHAMINMAX)
{
l9_71=1.001;
}
#else
{
l9_71=0.001;
}
#endif
float l9_72=l9_71-0.001;
vec3 l9_73;
vec3 l9_74;
if (l9_68!=0.0)
{
float l9_75=fract((l9_18*82.124229)+l9_17);
vec3 l9_76=vec3(l9_17);
vec3 l9_77;
if (l9_70!=0.0)
{
l9_77=fract((vec3(l9_75)*27.21883)+l9_76);
}
else
{
l9_77=fract((vec3(l9_75,fract((l9_18*9115.2148)+l9_17),fract((l9_18*654.15588)+l9_17))*27.21883)+l9_76);
}
l9_74=mix(colorMinEnd,colorMaxEnd,l9_77);
l9_73=mix(colorMinStart,colorMaxStart,l9_77);
}
else
{
l9_74=colorEnd;
l9_73=colorStart;
}
float l9_78;
float l9_79;
if (l9_72!=0.0)
{
float l9_80=fract((l9_18*3.3331299)+l9_17);
l9_79=mix(alphaMinEnd,alphaMaxEnd,l9_80);
l9_78=mix(alphaMinStart,alphaMaxStart,l9_80);
}
else
{
l9_79=alphaEnd;
l9_78=alphaStart;
}
vec3 l9_81=mix(l9_73,l9_74,vec3(l9_24));
float l9_82=mix(l9_78,l9_79,l9_24);
float l9_83;
#if (COLORRAMP)
{
l9_83=1.001;
}
#else
{
l9_83=0.001;
}
#endif
float l9_84=l9_83-0.001;
float l9_85;
#if (NORANDOFFSET)
{
l9_85=1.001;
}
#else
{
l9_85=0.001;
}
#endif
float l9_86=ceil(l9_24*colorRampTextureSize.x)/colorRampTextureSize.x;
float l9_87;
if ((l9_85-0.001)!=0.0)
{
l9_87=l9_86+(varPackedTex.x/colorRampTextureSize.x);
}
else
{
l9_87=l9_86;
}
int l9_88;
#if (colorRampTextureHasSwappedViews)
{
l9_88=1-sc_GetStereoViewIndex();
}
#else
{
l9_88=sc_GetStereoViewIndex();
}
#endif
float l9_89=l9_87;
sc_SoftwareWrapEarly(l9_89,ivec2(SC_SOFTWARE_WRAP_MODE_U_colorRampTexture,SC_SOFTWARE_WRAP_MODE_V_colorRampTexture).x);
float l9_90=l9_89;
float l9_91=0.5;
sc_SoftwareWrapEarly(l9_91,ivec2(SC_SOFTWARE_WRAP_MODE_U_colorRampTexture,SC_SOFTWARE_WRAP_MODE_V_colorRampTexture).y);
float l9_92=l9_91;
vec2 l9_93;
float l9_94;
#if (SC_USE_UV_MIN_MAX_colorRampTexture)
{
bool l9_95;
#if (SC_USE_CLAMP_TO_BORDER_colorRampTexture)
{
l9_95=ivec2(SC_SOFTWARE_WRAP_MODE_U_colorRampTexture,SC_SOFTWARE_WRAP_MODE_V_colorRampTexture).x==3;
}
#else
{
l9_95=(int(SC_USE_CLAMP_TO_BORDER_colorRampTexture)!=0);
}
#endif
float l9_96=l9_90;
float l9_97=1.0;
sc_ClampUV(l9_96,colorRampTextureUvMinMax.x,colorRampTextureUvMinMax.z,l9_95,l9_97);
float l9_98=l9_96;
float l9_99=l9_97;
bool l9_100;
#if (SC_USE_CLAMP_TO_BORDER_colorRampTexture)
{
l9_100=ivec2(SC_SOFTWARE_WRAP_MODE_U_colorRampTexture,SC_SOFTWARE_WRAP_MODE_V_colorRampTexture).y==3;
}
#else
{
l9_100=(int(SC_USE_CLAMP_TO_BORDER_colorRampTexture)!=0);
}
#endif
float l9_101=l9_92;
float l9_102=l9_99;
sc_ClampUV(l9_101,colorRampTextureUvMinMax.y,colorRampTextureUvMinMax.w,l9_100,l9_102);
l9_94=l9_102;
l9_93=vec2(l9_98,l9_101);
}
#else
{
l9_94=1.0;
l9_93=vec2(l9_90,l9_92);
}
#endif
vec2 l9_103=sc_TransformUV(l9_93,(int(SC_USE_UV_TRANSFORM_colorRampTexture)!=0),colorRampTextureTransform);
float l9_104=l9_103.x;
float l9_105=l9_94;
sc_SoftwareWrapLate(l9_104,ivec2(SC_SOFTWARE_WRAP_MODE_U_colorRampTexture,SC_SOFTWARE_WRAP_MODE_V_colorRampTexture).x,(int(SC_USE_CLAMP_TO_BORDER_colorRampTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_colorRampTexture)!=0)),l9_105);
float l9_106=l9_103.y;
float l9_107=l9_105;
sc_SoftwareWrapLate(l9_106,ivec2(SC_SOFTWARE_WRAP_MODE_U_colorRampTexture,SC_SOFTWARE_WRAP_MODE_V_colorRampTexture).y,(int(SC_USE_CLAMP_TO_BORDER_colorRampTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_colorRampTexture)!=0)),l9_107);
float l9_108=l9_107;
vec3 l9_109=sc_SamplingCoordsViewToGlobal(vec2(l9_104,l9_106),colorRampTextureLayout,l9_88);
vec4 l9_110=texture2D(colorRampTexture,l9_109.xy,0.0);
vec4 l9_111;
#if (SC_USE_CLAMP_TO_BORDER_colorRampTexture)
{
l9_111=mix(colorRampTextureBorderColor,l9_110,vec4(l9_108));
}
#else
{
l9_111=l9_110;
}
#endif
vec4 l9_112=l9_111*colorRampMult;
float l9_113;
#if (ALPHADISSOLVE)
{
l9_113=1.001;
}
#else
{
l9_113=0.001;
}
#endif
float l9_114=l9_113-0.001;
float l9_115;
#if (BLACKASALPHA)
{
l9_115=1.001;
}
#else
{
l9_115=0.001;
}
#endif
float l9_116=l9_115-0.001;
float l9_117;
#if (PREMULTIPLIEDCOLOR)
{
l9_117=1.001;
}
#else
{
l9_117=0.001;
}
#endif
float l9_118=l9_117-0.001;
vec4 l9_119;
if (l9_2!=0.0)
{
float l9_120=varPackedTex.x;
sc_SoftwareWrapEarly(l9_120,ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).x);
float l9_121=l9_120;
float l9_122=varPackedTex.y;
sc_SoftwareWrapEarly(l9_122,ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).y);
float l9_123=l9_122;
vec2 l9_124;
float l9_125;
#if (SC_USE_UV_MIN_MAX_mainTexture)
{
bool l9_126;
#if (SC_USE_CLAMP_TO_BORDER_mainTexture)
{
l9_126=ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).x==3;
}
#else
{
l9_126=(int(SC_USE_CLAMP_TO_BORDER_mainTexture)!=0);
}
#endif
float l9_127=l9_121;
float l9_128=1.0;
sc_ClampUV(l9_127,mainTextureUvMinMax.x,mainTextureUvMinMax.z,l9_126,l9_128);
float l9_129=l9_127;
float l9_130=l9_128;
bool l9_131;
#if (SC_USE_CLAMP_TO_BORDER_mainTexture)
{
l9_131=ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).y==3;
}
#else
{
l9_131=(int(SC_USE_CLAMP_TO_BORDER_mainTexture)!=0);
}
#endif
float l9_132=l9_123;
float l9_133=l9_130;
sc_ClampUV(l9_132,mainTextureUvMinMax.y,mainTextureUvMinMax.w,l9_131,l9_133);
l9_125=l9_133;
l9_124=vec2(l9_129,l9_132);
}
#else
{
l9_125=1.0;
l9_124=vec2(l9_121,l9_123);
}
#endif
vec2 l9_134=sc_TransformUV(l9_124,(int(SC_USE_UV_TRANSFORM_mainTexture)!=0),mainTextureTransform);
float l9_135=l9_134.x;
float l9_136=l9_125;
sc_SoftwareWrapLate(l9_135,ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).x,(int(SC_USE_CLAMP_TO_BORDER_mainTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_mainTexture)!=0)),l9_136);
float l9_137=l9_134.y;
float l9_138=l9_136;
sc_SoftwareWrapLate(l9_137,ivec2(SC_SOFTWARE_WRAP_MODE_U_mainTexture,SC_SOFTWARE_WRAP_MODE_V_mainTexture).y,(int(SC_USE_CLAMP_TO_BORDER_mainTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_mainTexture)!=0)),l9_138);
float l9_139=l9_138;
vec3 l9_140=sc_SamplingCoordsViewToGlobal(vec2(l9_135,l9_137),mainTextureLayout,mainTextureGetStereoViewIndex());
vec4 l9_141=texture2D(mainTexture,l9_140.xy,0.0);
vec4 l9_142;
#if (SC_USE_CLAMP_TO_BORDER_mainTexture)
{
l9_142=mix(mainTextureBorderColor,l9_141,vec4(l9_139));
}
#else
{
l9_142=l9_141;
}
#endif
vec4 l9_143;
if (l9_4!=0.0)
{
vec4 l9_144;
if (l9_66!=0.0)
{
l9_144=l9_37;
}
else
{
l9_144=l9_36;
}
l9_143=l9_144;
}
else
{
l9_143=l9_142;
}
l9_119=l9_143;
}
else
{
l9_119=vec4(1.0);
}
vec4 l9_145;
if (l9_84!=0.0)
{
vec4 l9_146;
#if (!(!((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)))
{
l9_146=l9_112;
}
#else
{
l9_146=vec4(1.0);
}
#endif
l9_145=l9_146;
}
else
{
l9_145=vec4(1.0);
}
vec4 l9_147=l9_119*vec4(l9_81,l9_82);
vec4 l9_148=l9_147*l9_145;
vec4 l9_149;
if (l9_114!=0.0)
{
vec4 l9_150=l9_148;
l9_150.w=clamp(l9_148.w-(l9_24*alphaDissolveMult),0.0,1.0);
l9_149=l9_150;
}
else
{
l9_149=l9_148;
}
vec4 l9_151;
if (l9_116!=0.0)
{
vec4 l9_152=l9_149;
l9_152.w=length(l9_149.xyz);
l9_151=l9_152;
}
else
{
l9_151=l9_149;
}
vec4 l9_153;
if (l9_118!=0.0)
{
vec3 l9_154=l9_151.xyz*l9_151.w;
l9_153=vec4(l9_154.x,l9_154.y,l9_154.z,l9_151.w);
}
else
{
l9_153=l9_151;
}
#if (sc_BlendMode_AlphaTest)
{
if (l9_153.w<alphaTestThreshold)
{
discard;
}
}
#endif
#if (ENABLE_STIPPLE_PATTERN_TEST)
{
if (l9_153.w<((mod(dot(floor(mod(gl_FragCoord.xy,vec2(4.0))),vec2(4.0,1.0))*9.0,16.0)+1.0)/17.0))
{
discard;
}
}
#endif
vec4 l9_155;
#if (sc_ProjectiveShadowsCaster)
{
float l9_156;
#if (((sc_BlendMode_Normal||sc_BlendMode_AlphaToCoverage)||sc_BlendMode_PremultipliedAlphaHardware)||sc_BlendMode_PremultipliedAlphaAuto)
{
l9_156=l9_153.w;
}
#else
{
float l9_157;
#if (sc_BlendMode_PremultipliedAlpha)
{
l9_157=clamp(l9_153.w*2.0,0.0,1.0);
}
#else
{
float l9_158;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_158=clamp(dot(l9_153.xyz,vec3(l9_153.w)),0.0,1.0);
}
#else
{
float l9_159;
#if (sc_BlendMode_AlphaTest)
{
l9_159=1.0;
}
#else
{
float l9_160;
#if (sc_BlendMode_Multiply)
{
l9_160=(1.0-dot(l9_153.xyz,vec3(0.33333001)))*l9_153.w;
}
#else
{
float l9_161;
#if (sc_BlendMode_MultiplyOriginal)
{
l9_161=(1.0-clamp(dot(l9_153.xyz,vec3(1.0)),0.0,1.0))*l9_153.w;
}
#else
{
float l9_162;
#if (sc_BlendMode_ColoredGlass)
{
l9_162=clamp(dot(l9_153.xyz,vec3(1.0)),0.0,1.0)*l9_153.w;
}
#else
{
float l9_163;
#if (sc_BlendMode_Add)
{
l9_163=clamp(dot(l9_153.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_164;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_164=clamp(dot(l9_153.xyz,vec3(1.0)),0.0,1.0)*l9_153.w;
}
#else
{
float l9_165;
#if (sc_BlendMode_Screen)
{
l9_165=dot(l9_153.xyz,vec3(0.33333001))*l9_153.w;
}
#else
{
float l9_166;
#if (sc_BlendMode_Min)
{
l9_166=1.0-clamp(dot(l9_153.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_167;
#if (sc_BlendMode_Max)
{
l9_167=clamp(dot(l9_153.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
l9_167=1.0;
}
#endif
l9_166=l9_167;
}
#endif
l9_165=l9_166;
}
#endif
l9_164=l9_165;
}
#endif
l9_163=l9_164;
}
#endif
l9_162=l9_163;
}
#endif
l9_161=l9_162;
}
#endif
l9_160=l9_161;
}
#endif
l9_159=l9_160;
}
#endif
l9_158=l9_159;
}
#endif
l9_157=l9_158;
}
#endif
l9_156=l9_157;
}
#endif
l9_155=vec4(mix(sc_ShadowColor.xyz,sc_ShadowColor.xyz*l9_153.xyz,vec3(sc_ShadowColor.w)),sc_ShadowDensity*l9_156);
}
#else
{
vec4 l9_168;
#if (sc_RenderAlphaToColor)
{
l9_168=vec4(l9_153.w);
}
#else
{
vec4 l9_169;
#if (sc_BlendMode_Custom)
{
vec4 l9_170;
#if (sc_FramebufferFetch)
{
vec4 l9_171=sc_readFragData0_Platform();
vec4 l9_172;
#if (sc_UseFramebufferFetchMarker)
{
vec4 l9_173=l9_171;
l9_173.x=l9_171.x+_sc_framebufferFetchMarker;
l9_172=l9_173;
}
#else
{
l9_172=l9_171;
}
#endif
l9_170=l9_172;
}
#else
{
vec2 l9_174=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
int l9_175;
#if (sc_ScreenTextureHasSwappedViews)
{
l9_175=1-sc_GetStereoViewIndex();
}
#else
{
l9_175=sc_GetStereoViewIndex();
}
#endif
l9_170=texture2D(sc_ScreenTexture,sc_SamplingCoordsViewToGlobal(l9_174,sc_ScreenTextureLayout,l9_175).xy,0.0);
}
#endif
vec4 l9_176;
#if (((sc_IsEditor&&sc_GetFramebufferColorInvalidUsageMarker)&&(!sc_BlendMode_Software))&&(!sc_BlendMode_ColoredGlass))
{
vec4 l9_177=l9_170;
l9_177.x=l9_170.x+_sc_GetFramebufferColorInvalidUsageMarker;
l9_176=l9_177;
}
#else
{
l9_176=l9_170;
}
#endif
vec3 l9_178=mix(l9_176.xyz,definedBlend(l9_176.xyz,l9_153.xyz).xyz,vec3(l9_153.w));
vec4 l9_179=vec4(l9_178.x,l9_178.y,l9_178.z,vec4(0.0).w);
l9_179.w=1.0;
l9_169=l9_179;
}
#else
{
vec4 l9_180;
#if (sc_BlendMode_MultiplyOriginal)
{
l9_180=vec4(mix(vec3(1.0),l9_153.xyz,vec3(l9_153.w)),l9_153.w);
}
#else
{
vec4 l9_181;
#if (sc_BlendMode_Screen||sc_BlendMode_PremultipliedAlphaAuto)
{
float l9_182;
#if (sc_BlendMode_PremultipliedAlphaAuto)
{
l9_182=clamp(l9_153.w,0.0,1.0);
}
#else
{
l9_182=l9_153.w;
}
#endif
l9_181=vec4(l9_153.xyz*l9_182,l9_182);
}
#else
{
l9_181=l9_153;
}
#endif
l9_180=l9_181;
}
#endif
l9_169=l9_180;
}
#endif
l9_168=l9_169;
}
#endif
l9_155=l9_168;
}
#endif
vec4 l9_183;
if (PreviewEnabled==1)
{
vec4 l9_184;
if (((PreviewVertexSaved*1.0)!=0.0) ? true : false)
{
l9_184=PreviewVertexColor;
}
else
{
l9_184=vec4(0.0);
}
l9_183=l9_184;
}
else
{
l9_183=l9_155;
}
vec4 l9_185;
#if (sc_ShaderComplexityAnalyzer)
{
l9_185=vec4(shaderComplexityValue/255.0,0.0,0.0,1.0);
}
#else
{
l9_185=vec4(0.0);
}
#endif
vec4 l9_186;
if (l9_185.w>0.0)
{
l9_186=l9_185;
}
else
{
l9_186=l9_183;
}
vec4 l9_187=outputMotionVectorsIfNeeded(varPos,max(l9_186,vec4(0.0)));
vec4 l9_188=clamp(l9_187,vec4(0.0),vec4(1.0));
#if (sc_OITDepthBoundsPass)
{
#if (sc_OITDepthBoundsPass)
{
float l9_189=clamp(viewSpaceDepth()/1000.0,0.0,1.0);
sc_writeFragData0(vec4(max(0.0,1.0-(l9_189-0.0039215689)),min(1.0,l9_189+0.0039215689),0.0,0.0));
}
#endif
}
#else
{
#if (sc_OITDepthPrepass)
{
sc_writeFragData0(vec4(1.0));
}
#else
{
#if (sc_OITDepthGatherPass)
{
#if (sc_OITDepthGatherPass)
{
vec2 l9_190=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,l9_190).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_191=encodeDepth(viewSpaceDepth(),texture2D(sc_OITFilteredDepthBoundsTexture,l9_190).xy);
float l9_192=packValue(l9_191);
int l9_199=int(l9_188.w*255.0);
float l9_200=packValue(l9_199);
sc_writeFragData0(vec4(packValue(l9_191),packValue(l9_191),packValue(l9_191),packValue(l9_191)));
sc_writeFragData1(vec4(l9_192,packValue(l9_191),packValue(l9_191),packValue(l9_191)));
sc_writeFragData2(vec4(l9_200,packValue(l9_199),packValue(l9_199),packValue(l9_199)));
#if (sc_OITMaxLayersVisualizeLayerCount)
{
sc_writeFragData2(vec4(0.0039215689,0.0,0.0,0.0));
}
#endif
}
#endif
}
#else
{
#if (sc_OITCompositingPass)
{
#if (sc_OITCompositingPass)
{
vec2 l9_203=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,l9_203).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_204[8];
int l9_205[8];
int l9_206=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_206<8)
{
l9_204[l9_206]=0;
l9_205[l9_206]=0;
l9_206++;
continue;
}
else
{
break;
}
}
int l9_207;
#if (sc_OITMaxLayers8)
{
l9_207=2;
}
#else
{
l9_207=1;
}
#endif
int l9_208=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_208<l9_207)
{
vec4 l9_209;
vec4 l9_210;
vec4 l9_211;
if (l9_208==0)
{
l9_211=texture2D(sc_OITAlpha0,l9_203);
l9_210=texture2D(sc_OITDepthLow0,l9_203);
l9_209=texture2D(sc_OITDepthHigh0,l9_203);
}
else
{
l9_211=vec4(0.0);
l9_210=vec4(0.0);
l9_209=vec4(0.0);
}
vec4 l9_212;
vec4 l9_213;
vec4 l9_214;
if (l9_208==1)
{
l9_214=texture2D(sc_OITAlpha1,l9_203);
l9_213=texture2D(sc_OITDepthLow1,l9_203);
l9_212=texture2D(sc_OITDepthHigh1,l9_203);
}
else
{
l9_214=l9_211;
l9_213=l9_210;
l9_212=l9_209;
}
if (any(notEqual(l9_212,vec4(0.0)))||any(notEqual(l9_213,vec4(0.0))))
{
int l9_215[8]=l9_204;
unpackValues(l9_212.w,l9_208,l9_215);
unpackValues(l9_212.z,l9_208,l9_215);
unpackValues(l9_212.y,l9_208,l9_215);
unpackValues(l9_212.x,l9_208,l9_215);
unpackValues(l9_213.w,l9_208,l9_215);
unpackValues(l9_213.z,l9_208,l9_215);
unpackValues(l9_213.y,l9_208,l9_215);
unpackValues(l9_213.x,l9_208,l9_215);
int l9_224[8]=l9_205;
unpackValues(l9_214.w,l9_208,l9_224);
unpackValues(l9_214.z,l9_208,l9_224);
unpackValues(l9_214.y,l9_208,l9_224);
unpackValues(l9_214.x,l9_208,l9_224);
}
l9_208++;
continue;
}
else
{
break;
}
}
vec4 l9_229=texture2D(sc_OITFilteredDepthBoundsTexture,l9_203);
vec2 l9_230=l9_229.xy;
int l9_231;
#if (sc_SkinBonesCount>0)
{
l9_231=encodeDepth(((1.0-l9_229.x)*1000.0)+getDepthOrderingEpsilon(),l9_230);
}
#else
{
l9_231=0;
}
#endif
int l9_232=encodeDepth(viewSpaceDepth(),l9_230);
vec4 l9_233;
l9_233=l9_188*l9_188.w;
vec4 l9_234;
int l9_235=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_235<8)
{
int l9_236=l9_204[l9_235];
int l9_237=l9_232-l9_231;
bool l9_238=l9_236<l9_237;
bool l9_239;
if (l9_238)
{
l9_239=l9_204[l9_235]>0;
}
else
{
l9_239=l9_238;
}
if (l9_239)
{
vec3 l9_240=l9_233.xyz*(1.0-(float(l9_205[l9_235])/255.0));
l9_234=vec4(l9_240.x,l9_240.y,l9_240.z,l9_233.w);
}
else
{
l9_234=l9_233;
}
l9_233=l9_234;
l9_235++;
continue;
}
else
{
break;
}
}
sc_writeFragData0(l9_233);
#if (sc_OITMaxLayersVisualizeLayerCount)
{
discard;
}
#endif
}
#endif
}
#else
{
#if (sc_OITFrontLayerPass)
{
#if (sc_OITFrontLayerPass)
{
if (abs(gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw)).x)>getFrontLayerZTestEpsilon())
{
discard;
}
sc_writeFragData0(l9_188);
}
#endif
}
#else
{
sc_writeFragData0(l9_187);
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif // #elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
