//#include <required.glsl> // [HACK 4/6/2023] See SCC shader_merger.cpp
//SG_REFLECTION_BEGIN(200)
//attribute vec4 position 0
//attribute vec2 texture0 3
//attribute vec2 texture1 4
//attribute vec3 normal 1
//attribute vec4 tangent 2
//sampler sampler renderTarget0SmpSC 0:20
//sampler sampler renderTarget1SmpSC 0:21
//sampler sampler renderTarget2SmpSC 0:22
//sampler sampler renderTarget3SmpSC 0:23
//texture texture2D renderTarget0 0:1:0:20
//texture texture2D renderTarget1 0:2:0:21
//texture texture2D renderTarget2 0:3:0:22
//texture texture2D renderTarget3 0:4:0:23
//SG_REFLECTION_END
#if defined VERTEX_SHADER
#define SC_DISABLE_FRUSTUM_CULLING
#define SC_ALLOW_16_TEXTURES
#define SC_ENABLE_INSTANCED_RENDERING
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
struct ssParticle
{
vec3 Position;
vec3 Velocity;
vec4 Color;
float Size;
float Age;
float Life;
float Mass;
mat3 Matrix;
bool Dead;
vec4 Quaternion;
float SpawnIndex;
float SpawnIndexRemainder;
float NextBurstTime;
float collisionCount_N119;
float SpawnOffset;
float Seed;
vec2 Seed2000;
float TimeShift;
int Index1D;
int Index1DPerCopy;
float Index1DPerCopyF;
int StateID;
float Coord1D;
float Ratio1D;
float Ratio1DPerCopy;
ivec2 Index2D;
vec2 Coord2D;
vec2 Ratio2D;
vec3 Force;
bool Spawned;
float CopyId;
float SpawnAmount;
float BurstAmount;
float BurstPeriod;
};
struct ssGlobals
{
float gTimeElapsed;
float gTimeDelta;
float gTimeElapsedShifted;
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
#ifndef sc_StereoRendering_IsClipDistanceEnabled
#define sc_StereoRendering_IsClipDistanceEnabled 0
#endif
#ifndef sc_NumStereoViews
#define sc_NumStereoViews 1
#endif
#ifndef sc_ShaderCacheConstant
#define sc_ShaderCacheConstant 0
#endif
struct sc_Camera_t
{
vec3 position;
float aspect;
vec2 clipPlanes;
};
#ifndef SC_DEVICE_CLASS
#define SC_DEVICE_CLASS -1
#endif
#ifndef SC_GL_FRAGMENT_PRECISION_HIGH
#define SC_GL_FRAGMENT_PRECISION_HIGH 0
#elif SC_GL_FRAGMENT_PRECISION_HIGH==1
#undef SC_GL_FRAGMENT_PRECISION_HIGH
#define SC_GL_FRAGMENT_PRECISION_HIGH 1
#endif
#ifndef renderTarget0HasSwappedViews
#define renderTarget0HasSwappedViews 0
#elif renderTarget0HasSwappedViews==1
#undef renderTarget0HasSwappedViews
#define renderTarget0HasSwappedViews 1
#endif
#ifndef renderTarget0Layout
#define renderTarget0Layout 0
#endif
#ifndef renderTarget1HasSwappedViews
#define renderTarget1HasSwappedViews 0
#elif renderTarget1HasSwappedViews==1
#undef renderTarget1HasSwappedViews
#define renderTarget1HasSwappedViews 1
#endif
#ifndef renderTarget1Layout
#define renderTarget1Layout 0
#endif
#ifndef renderTarget2HasSwappedViews
#define renderTarget2HasSwappedViews 0
#elif renderTarget2HasSwappedViews==1
#undef renderTarget2HasSwappedViews
#define renderTarget2HasSwappedViews 1
#endif
#ifndef renderTarget2Layout
#define renderTarget2Layout 0
#endif
#ifndef renderTarget3HasSwappedViews
#define renderTarget3HasSwappedViews 0
#elif renderTarget3HasSwappedViews==1
#undef renderTarget3HasSwappedViews
#define renderTarget3HasSwappedViews 1
#endif
#ifndef renderTarget3Layout
#define renderTarget3Layout 0
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
uniform mat4 sc_ViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewMatrixArray[sc_NumStereoViews];
uniform sc_Camera_t sc_Camera;
uniform mat4 sc_ProjectionMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ViewMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ProjectionMatrixArray[sc_NumStereoViews];
uniform vec4 intensityTextureDims;
uniform vec4 renderTarget0Dims;
uniform vec4 renderTarget1Dims;
uniform vec4 renderTarget2Dims;
uniform vec4 renderTarget3Dims;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform int vfxOffsetInstancesRead;
uniform int vfxTargetWidth;
uniform vec2 vfxTargetSizeRead;
uniform bool vfxBatchEnable[32];
uniform float Port_Input1_N149;
uniform vec3 Port_Min_N150;
uniform vec3 Port_Max_N150;
uniform float Port_Import_N151;
uniform float Port_Input1_N153;
uniform vec3 Port_Max_N154;
uniform float Port_Import_N157;
uniform vec3 Port_Import_N158;
uniform float Port_Input1_N162;
uniform float Port_Input1_N165;
uniform float Port_Import_N042;
uniform float Port_Import_N043;
uniform vec3 vfxLocalAabbMax;
uniform vec3 vfxLocalAabbMin;
uniform float particles_speed;
uniform float particlesReduce;
uniform vec3 Port_Import_N216;
uniform float Port_Import_N023;
uniform float Port_Import_N024;
uniform float Port_Import_N053;
uniform vec3 Port_Import_N054;
uniform vec3 Port_Import_N187;
uniform mat4 vfxModelMatrix[32];
uniform float Tweak_N12;
uniform float particle_scale;
uniform float overrideTimeDelta;
uniform vec3 Port_Import_N142;
uniform vec3 Port_Import_N006;
uniform float Port_Input1_N014;
uniform vec3 Port_Import_N208;
uniform vec3 Port_Import_N318;
uniform float Port_Multiplier_N319;
uniform vec3 Port_Import_N322;
uniform vec2 Port_Input1_N326;
uniform vec2 Port_Scale_N327;
uniform vec2 Port_Input1_N329;
uniform vec2 Port_Scale_N330;
uniform vec2 Port_Input1_N332;
uniform vec2 Port_Scale_N333;
uniform vec3 Port_Input1_N335;
uniform float Port_Import_N126;
uniform float Port_Import_N127;
uniform float Port_Import_N128;
uniform float Port_Input4_N137;
uniform float Port_Multiplier_N272;
uniform vec3 Port_Import_N112;
uniform float Port_Value1_N213;
uniform float Port_Value2_N213;
uniform float Port_Value3_N213;
uniform vec3 Port_Import_N113;
uniform float Port_Import_N114;
uniform float Port_Import_N115;
uniform float Port_Import_N116;
uniform float Port_CollisionCount_N118;
uniform float Port_VelocityThreshold_N118;
uniform float Port_DefaultFloat_N119;
uniform float Port_Input1_N171;
uniform float Port_Input1_N109;
uniform float Port_Input2_N109;
uniform mat4 vfxViewMatrixInverse;
uniform float Port_Input1_N184;
uniform vec4 Port_Value0_N176;
uniform float Port_Position1_N176;
uniform vec4 Port_Value1_N176;
uniform float Port_Position2_N176;
uniform vec4 Port_Value2_N176;
uniform float Port_Position3_N176;
uniform vec4 Port_Value3_N176;
uniform vec4 Port_Value4_N176;
uniform vec2 vfxTargetSizeWrite;
uniform int vfxOffsetInstancesWrite;
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
uniform mat3 sc_NormalMatrix;
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
uniform float sc_DisableFrustumCullingMarker;
uniform vec4 weights0;
uniform vec4 weights1;
uniform vec4 weights2;
uniform int sc_FallbackInstanceID;
uniform float _sc_framebufferFetchMarker;
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
uniform float correctedIntensity;
uniform vec4 intensityTextureSize;
uniform vec4 intensityTextureView;
uniform mat3 intensityTextureTransform;
uniform vec4 intensityTextureUvMinMax;
uniform vec4 intensityTextureBorderColor;
uniform float reflBlurWidth;
uniform float reflBlurMinRough;
uniform float reflBlurMaxRough;
uniform int vfxNumCopies;
uniform bool vfxEmitParticle[32];
uniform vec4 renderTarget0Size;
uniform vec4 renderTarget0View;
uniform vec4 renderTarget1Size;
uniform vec4 renderTarget1View;
uniform vec4 renderTarget2Size;
uniform vec4 renderTarget2View;
uniform vec4 renderTarget3Size;
uniform vec4 renderTarget3View;
uniform float vfxCameraAspect;
uniform float vfxCameraNear;
uniform float vfxCameraFar;
uniform vec3 vfxCameraUp;
uniform vec3 vfxCameraForward;
uniform vec3 vfxCameraRight;
uniform mat4 vfxProjectionMatrix;
uniform mat4 vfxProjectionMatrixInverse;
uniform mat4 vfxViewMatrix;
uniform mat4 vfxViewProjectionMatrix;
uniform mat4 vfxViewProjectionMatrixInverse;
uniform int vfxFrame;
uniform float Port_Import_N189;
uniform vec3 Port_Import_N206;
uniform sampler2D renderTarget0;
uniform sampler2D renderTarget1;
uniform sampler2D renderTarget2;
uniform sampler2D renderTarget3;
varying float varClipDistance;
varying float varStereoViewID;
attribute vec4 position;
attribute vec2 texture0;
attribute vec2 texture1;
varying vec3 varPos;
varying vec4 varPackedTex;
varying vec4 varScreenPos;
varying vec2 varScreenTexturePos;
varying float Interp_Particle_Index;
varying vec2 Interp_Particle_Coord;
varying vec3 Interp_Particle_Force;
varying float Interp_Particle_SpawnIndex;
varying float Interp_Particle_NextBurstTime;
varying vec3 Interp_Particle_Position;
varying vec3 Interp_Particle_Velocity;
varying float Interp_Particle_Life;
varying float Interp_Particle_Age;
varying float Interp_Particle_Size;
varying vec4 Interp_Particle_Color;
varying vec4 Interp_Particle_Quaternion;
varying float Interp_Particle_collisionCount_N119;
varying float Interp_Particle_Mass;
varying vec3 varNormal;
varying vec4 varTangent;
varying vec2 varShadowTex;
attribute vec3 normal;
attribute vec4 tangent;
varying vec4 varColor;
ssParticle gParticle;
int sc_GetLocalInstanceID()
{
#ifdef sc_LocalInstanceID
    return sc_LocalInstanceID;
#else
    return 0;
#endif
}
void ssCalculateParticleSeed(inout ssParticle Particle)
{
float l9_0;
if (overrideTimeEnabled==1)
{
l9_0=overrideTimeElapsed;
}
else
{
l9_0=sc_Time.x;
}
Particle.Seed=(Particle.Ratio1D*0.97637898)+0.151235;
Particle.Seed+=(floor(((((l9_0-Particle.SpawnOffset)-0.0)+0.0)+0.40000001)/0.2)*4.32723);
Particle.Seed=fract(abs(Particle.Seed));
Particle.Seed2000=(vec2(ivec2(Particle.Index1D%400,Particle.Index1D/400))+vec2(1.0))/vec2(399.0);
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
int renderTarget0GetStereoViewIndex()
{
int l9_0;
#if (renderTarget0HasSwappedViews)
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
vec4 renderTarget0SampleViewIndexLevel(vec2 uv,int viewIndex,float level_)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
float l9_1=level_;
vec3 l9_2=sc_SamplingCoordsViewToGlobal(uv,renderTarget0Layout,viewIndex);
vec4 l9_3;
#if (sc_CanUseTextureLod)
{
l9_3=texture2DLod(renderTarget0,l9_2.xy,l9_1);
}
#else
{
l9_3=vec4(0.0);
}
#endif
l9_0=l9_3;
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
vec4 renderTarget0SampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
l9_0=renderTarget0SampleViewIndexLevel(uv,viewIndex,bias);
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
int renderTarget1GetStereoViewIndex()
{
int l9_0;
#if (renderTarget1HasSwappedViews)
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
vec4 renderTarget1SampleViewIndexLevel(vec2 uv,int viewIndex,float level_)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
float l9_1=level_;
vec3 l9_2=sc_SamplingCoordsViewToGlobal(uv,renderTarget1Layout,viewIndex);
vec4 l9_3;
#if (sc_CanUseTextureLod)
{
l9_3=texture2DLod(renderTarget1,l9_2.xy,l9_1);
}
#else
{
l9_3=vec4(0.0);
}
#endif
l9_0=l9_3;
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
vec4 renderTarget1SampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
l9_0=renderTarget1SampleViewIndexLevel(uv,viewIndex,bias);
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
int renderTarget2GetStereoViewIndex()
{
int l9_0;
#if (renderTarget2HasSwappedViews)
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
vec4 renderTarget2SampleViewIndexLevel(vec2 uv,int viewIndex,float level_)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
float l9_1=level_;
vec3 l9_2=sc_SamplingCoordsViewToGlobal(uv,renderTarget2Layout,viewIndex);
vec4 l9_3;
#if (sc_CanUseTextureLod)
{
l9_3=texture2DLod(renderTarget2,l9_2.xy,l9_1);
}
#else
{
l9_3=vec4(0.0);
}
#endif
l9_0=l9_3;
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
vec4 renderTarget2SampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
l9_0=renderTarget2SampleViewIndexLevel(uv,viewIndex,bias);
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
int renderTarget3GetStereoViewIndex()
{
int l9_0;
#if (renderTarget3HasSwappedViews)
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
vec4 renderTarget3SampleViewIndexLevel(vec2 uv,int viewIndex,float level_)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
float l9_1=level_;
vec3 l9_2=sc_SamplingCoordsViewToGlobal(uv,renderTarget3Layout,viewIndex);
vec4 l9_3;
#if (sc_CanUseTextureLod)
{
l9_3=texture2DLod(renderTarget3,l9_2.xy,l9_1);
}
#else
{
l9_3=vec4(0.0);
}
#endif
l9_0=l9_3;
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
vec4 renderTarget3SampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
l9_0=renderTarget3SampleViewIndexLevel(uv,viewIndex,bias);
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
float DecodeFloat32(vec4 rgba,bool Quantize)
{
if (Quantize)
{
rgba=floor((rgba*255.0)+vec4(0.5))/vec4(255.0);
}
return dot(rgba,vec4(1.0,0.0039215689,1.53787e-05,6.0308629e-08));
}
float DecodeFloat16(vec2 rg,bool Quantize)
{
if (Quantize)
{
rg=floor((rg*255.0)+vec2(0.5))/vec2(255.0);
}
return dot(rg,vec2(1.0,0.0039215689));
}
float DecodeFloat8(float r,bool Quantize)
{
if (Quantize)
{
r=floor((r*255.0)+0.5)/255.0;
}
return r;
}
bool ssDecodeParticle(int InstanceID)
{
gParticle.Position=vec3(0.0);
gParticle.Velocity=vec3(0.0);
gParticle.Color=vec4(0.0);
gParticle.Size=0.0;
gParticle.Age=0.0;
gParticle.Life=0.0;
gParticle.Mass=1.0;
gParticle.Matrix=mat3(vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),vec3(0.0,0.0,1.0));
gParticle.Quaternion=vec4(0.0,0.0,0.0,1.0);
gParticle.CopyId=float(InstanceID/40);
gParticle.SpawnIndex=-1.0;
gParticle.SpawnIndexRemainder=-1.0;
gParticle.SpawnAmount=0.0;
gParticle.BurstAmount=0.0;
gParticle.BurstPeriod=0.0;
gParticle.NextBurstTime=0.0;
int l9_0=InstanceID%40;
float l9_1=float(l9_0);
int l9_2=InstanceID/40;
ivec2 l9_3=ivec2(l9_0,l9_2);
float l9_4=float(InstanceID);
vec2 l9_5=vec2(l9_3);
float l9_6=l9_4/39.0;
ssParticle l9_7=ssParticle(gParticle.Position,gParticle.Velocity,gParticle.Color,gParticle.Size,gParticle.Age,gParticle.Life,gParticle.Mass,gParticle.Matrix,false,gParticle.Quaternion,gParticle.SpawnIndex,gParticle.SpawnIndexRemainder,gParticle.NextBurstTime,gParticle.collisionCount_N119,l9_6*0.2,0.0,gParticle.Seed2000,float(((InstanceID*((InstanceID*1471343)+101146501))+1559861749)&2147483647)*4.6566129e-10,InstanceID,l9_0,l9_1,(40*(l9_2+1))-1,(l9_4+0.5)/40.0,l9_6,l9_1/39.0,l9_3,(l9_5+vec2(0.5))/vec2(40.0,1.0),l9_5/vec2(39.0,1.0),vec3(0.0),false,gParticle.CopyId,gParticle.SpawnAmount,gParticle.BurstAmount,gParticle.BurstPeriod);
ssCalculateParticleSeed(l9_7);
gParticle=l9_7;
int l9_8=InstanceID;
int l9_9=(vfxOffsetInstancesRead+l9_8)*4;
int l9_10=l9_9/vfxTargetWidth;
vec2 l9_11=(vec2(ivec2(l9_9-(l9_10*vfxTargetWidth),l9_10))+vec2(0.5))/vec2(2048.0,vfxTargetSizeRead.y);
vec2 l9_12=l9_11+vec2(0.0);
vec4 l9_13=renderTarget0SampleViewIndexBias(l9_12,renderTarget0GetStereoViewIndex(),0.0);
bool l9_14=dot(abs(l9_13),vec4(1.0))<9.9999997e-06;
bool l9_15;
if (!l9_14)
{
l9_15=!vfxBatchEnable[sc_GetLocalInstanceID()/40];
}
else
{
l9_15=l9_14;
}
if (l9_15)
{
return false;
}
gParticle.Position.x=(-1000.0)+(((DecodeFloat32(l9_13,true)-0.0)*(1000.0-(-1000.0)))/(0.99998999-0.0));
gParticle.Position.y=(-1000.0)+(((DecodeFloat32(renderTarget1SampleViewIndexBias(l9_12,renderTarget1GetStereoViewIndex(),0.0),true)-0.0)*(1000.0-(-1000.0)))/(0.99998999-0.0));
gParticle.Position.z=(-1000.0)+(((DecodeFloat32(renderTarget2SampleViewIndexBias(l9_12,renderTarget2GetStereoViewIndex(),0.0),true)-0.0)*(1000.0-(-1000.0)))/(0.99998999-0.0));
gParticle.Velocity.x=(-1000.0)+(((DecodeFloat32(renderTarget3SampleViewIndexBias(l9_12,renderTarget3GetStereoViewIndex(),0.0),true)-0.0)*(1000.0-(-1000.0)))/(0.99998999-0.0));
vec2 l9_16=l9_11+vec2(0.00048828125,0.0);
gParticle.Velocity.y=(-1000.0)+(((DecodeFloat32(renderTarget0SampleViewIndexBias(l9_16,renderTarget0GetStereoViewIndex(),0.0),true)-0.0)*(1000.0-(-1000.0)))/(0.99998999-0.0));
gParticle.Velocity.z=(-1000.0)+(((DecodeFloat32(renderTarget1SampleViewIndexBias(l9_16,renderTarget1GetStereoViewIndex(),0.0),true)-0.0)*(1000.0-(-1000.0)))/(0.99998999-0.0));
gParticle.Life=0.0+(((DecodeFloat32(renderTarget2SampleViewIndexBias(l9_16,renderTarget2GetStereoViewIndex(),0.0),true)-0.0)*(0.2-0.0))/(0.99998999-0.0));
gParticle.Age=0.0+(((DecodeFloat32(renderTarget3SampleViewIndexBias(l9_16,renderTarget3GetStereoViewIndex(),0.0),true)-0.0)*(0.2-0.0))/(0.99998999-0.0));
vec2 l9_17=l9_11+vec2(0.0009765625,0.0);
vec4 l9_18=renderTarget0SampleViewIndexBias(l9_17,renderTarget0GetStereoViewIndex(),0.0);
vec4 l9_19=renderTarget1SampleViewIndexBias(l9_17,renderTarget1GetStereoViewIndex(),0.0);
vec4 l9_20=renderTarget2SampleViewIndexBias(l9_17,renderTarget2GetStereoViewIndex(),0.0);
vec4 l9_21=renderTarget3SampleViewIndexBias(l9_17,renderTarget3GetStereoViewIndex(),0.0);
gParticle.Size=0.0+(((DecodeFloat16(vec2(l9_18.xy),true)-0.0)*(100.0-0.0))/(0.99998999-0.0));
gParticle.Quaternion.x=(-1.0)+(((DecodeFloat16(vec2(l9_18.zw),true)-0.0)*(1.0-(-1.0)))/(0.99998999-0.0));
gParticle.Quaternion.y=(-1.0)+(((DecodeFloat16(vec2(l9_19.xy),true)-0.0)*(1.0-(-1.0)))/(0.99998999-0.0));
gParticle.Quaternion.z=(-1.0)+(((DecodeFloat16(vec2(l9_19.zw),true)-0.0)*(1.0-(-1.0)))/(0.99998999-0.0));
gParticle.Quaternion.w=(-1.0)+(((DecodeFloat16(vec2(l9_20.xy),true)-0.0)*(1.0-(-1.0)))/(0.99998999-0.0));
gParticle.Mass=0.0+(((DecodeFloat16(vec2(l9_20.zw),true)-0.0)*(100.0-0.0))/(0.99998999-0.0));
gParticle.Color.x=0.0+(((DecodeFloat8(l9_21.x,true)-0.0)*(1.00001-0.0))/(1.0-0.0));
gParticle.Color.y=0.0+(((DecodeFloat8(l9_21.y,true)-0.0)*(1.00001-0.0))/(1.0-0.0));
gParticle.Color.z=0.0+(((DecodeFloat8(l9_21.z,true)-0.0)*(1.00001-0.0))/(1.0-0.0));
gParticle.Color.w=0.0+(((DecodeFloat8(l9_21.w,true)-0.0)*(1.00001-0.0))/(1.0-0.0));
vec2 l9_22=l9_11+vec2(0.0014648438,0.0);
gParticle.collisionCount_N119=0.0+(((DecodeFloat8(renderTarget0SampleViewIndexBias(l9_22,renderTarget0GetStereoViewIndex(),0.0).x,true)-0.0)*(255.0-0.0))/(1.0-0.0));
vec4 l9_23=normalize(gParticle.Quaternion.yzwx);
float l9_24=l9_23.x;
float l9_25=l9_24*l9_24;
float l9_26=l9_23.y;
float l9_27=l9_26*l9_26;
float l9_28=l9_23.z;
float l9_29=l9_28*l9_28;
float l9_30=l9_24*l9_28;
float l9_31=l9_24*l9_26;
float l9_32=l9_26*l9_28;
float l9_33=l9_23.w;
float l9_34=l9_33*l9_24;
float l9_35=l9_33*l9_26;
float l9_36=l9_33*l9_28;
gParticle.Matrix=mat3(vec3(1.0-(2.0*(l9_27+l9_29)),2.0*(l9_31+l9_36),2.0*(l9_30-l9_35)),vec3(2.0*(l9_31-l9_36),1.0-(2.0*(l9_25+l9_29)),2.0*(l9_32+l9_34)),vec3(2.0*(l9_30+l9_35),2.0*(l9_32-l9_34),1.0-(2.0*(l9_25+l9_27))));
gParticle.Velocity=floor((gParticle.Velocity*2000.0)+vec3(0.5))*0.00050000002;
gParticle.Position=floor((gParticle.Position*2000.0)+vec3(0.5))*0.00050000002;
gParticle.Color=floor((gParticle.Color*2000.0)+vec4(0.5))*0.00050000002;
gParticle.Size=floor((gParticle.Size*2000.0)+0.5)*0.00050000002;
gParticle.Mass=floor((gParticle.Mass*2000.0)+0.5)*0.00050000002;
gParticle.Life=floor((gParticle.Life*2000.0)+0.5)*0.00050000002;
return true;
}
vec4 ssRandVec4(int seed)
{
return vec4(float(((seed*((seed*1471343)+101146501))+1559861749)&2147483647)*4.6566129e-10,float((((seed*1399)*((seed*2058408857)+101146501))+1559861749)&2147483647)*4.6566129e-10,float((((seed*7177)*((seed*1969894119)+101146501))+1559861749)&2147483647)*4.6566129e-10,float((((seed*18919)*((seed*2066534441)+101146501))+1559861749)&2147483647)*4.6566129e-10);
}
vec3 ssRandVec3(int seed)
{
return vec3(float(((seed*((seed*1471343)+101146501))+1559861749)&2147483647)*4.6566129e-10,float((((seed*1399)*((seed*2058408857)+101146501))+1559861749)&2147483647)*4.6566129e-10,float((((seed*7177)*((seed*1969894119)+101146501))+1559861749)&2147483647)*4.6566129e-10);
}
vec2 ssRandVec2(int seed)
{
return vec2(float(((seed*((seed*1471343)+101146501))+1559861749)&2147483647)*4.6566129e-10,float((((seed*1399)*((seed*2058408857)+101146501))+1559861749)&2147483647)*4.6566129e-10);
}
vec4 ssGetParticleRandom(int Dimension,bool UseTime,bool UseNodeID,bool UseParticleID,float NodeID,ssParticle Particle,float ExtraSeed,float Time)
{
vec4 l9_0;
if (UseTime)
{
vec4 l9_1=vec4(0.0);
l9_1.x=floor(fract(Time)*1000.0);
l9_0=l9_1;
}
else
{
l9_0=vec4(0.0);
}
vec4 l9_2;
if (UseParticleID)
{
vec4 l9_3=l9_0;
l9_3.y=float(Particle.Index1D^((Particle.Index1D*15299)+Particle.Index1D));
l9_2=l9_3;
}
else
{
l9_2=l9_0;
}
vec4 l9_4;
if (UseNodeID)
{
vec4 l9_5=l9_2;
l9_5.z=NodeID;
l9_4=l9_5;
}
else
{
l9_4=l9_2;
}
float l9_6=ExtraSeed;
int l9_7=(((int(l9_4.x)*15299)^(int(l9_4.y)*30133))^(int(l9_4.z)*17539))^(int(l9_6*1000.0)*12113);
vec4 l9_8;
if (Dimension==1)
{
vec4 l9_9=vec4(0.0);
l9_9.x=float(((l9_7*((l9_7*1471343)+101146501))+1559861749)&2147483647)*4.6566129e-10;
l9_8=l9_9;
}
else
{
vec4 l9_10;
if (Dimension==2)
{
vec2 l9_11=ssRandVec2(l9_7);
l9_10=vec4(l9_11.x,l9_11.y,vec4(0.0).z,vec4(0.0).w);
}
else
{
vec4 l9_12;
if (Dimension==3)
{
vec3 l9_13=ssRandVec3(l9_7);
l9_12=vec4(l9_13.x,l9_13.y,l9_13.z,vec4(0.0).w);
}
else
{
l9_12=ssRandVec4(l9_7);
}
l9_10=l9_12;
}
l9_8=l9_10;
}
return l9_8;
}
void Node150_Particle_Random(vec3 Min,vec3 Max,out vec3 Random,ssGlobals Globals)
{
Random=mix(Min,Max,ssGetParticleRandom(3,true,true,true,150.0,gParticle,0.0,Globals.gTimeElapsed).xyz);
}
void Node154_Particle_Random(vec3 Min,vec3 Max,out vec3 Random,ssGlobals Globals)
{
Random=mix(Min,Max,ssGetParticleRandom(3,true,true,true,154.0,gParticle,0.0,Globals.gTimeElapsed).xyz);
}
void Node44_Particle_Random(float Min,float Max,out float Random,ssGlobals Globals)
{
Random=mix(Min,Max,ssGetParticleRandom(1,false,true,true,44.0,gParticle,0.0,Globals.gTimeElapsed).x);
}
void sc_SetClipDistancePlatform(float dstClipDistance)
{
    #if sc_StereoRenderingMode==sc_StereoRendering_InstancedClipped&&sc_StereoRendering_IsClipDistanceEnabled
        gl_ClipDistance[0]=dstClipDistance;
    #endif
}
void sc_SetClipDistance(float dstClipDistance)
{
#if (sc_StereoRendering_IsClipDistanceEnabled==1)
{
sc_SetClipDistancePlatform(dstClipDistance);
}
#else
{
varClipDistance=dstClipDistance;
}
#endif
}
void sc_SetClipDistance(vec4 clipPosition)
{
#if (sc_StereoRenderingMode==1)
{
sc_SetClipDistance(dot(clipPosition,sc_StereoClipPlanes[sc_StereoViewID]));
}
#endif
}
void sc_SetClipPosition(vec4 clipPosition)
{
#if (sc_ShaderCacheConstant!=0)
{
clipPosition.x+=(sc_UniformConstants.x*float(sc_ShaderCacheConstant));
}
#endif
#if (sc_StereoRenderingMode>0)
{
varStereoViewID=float(sc_StereoViewID);
}
#endif
sc_SetClipDistance(clipPosition);
gl_Position=clipPosition;
}
float snoise(vec2 v)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
vec2 l9_0=floor(v+vec2(dot(v,vec2(0.36602542))));
vec2 l9_1=(v-l9_0)+vec2(dot(l9_0,vec2(0.21132487)));
float l9_2=l9_1.x;
float l9_3=l9_1.y;
bvec2 l9_4=bvec2(l9_2>l9_3);
vec2 l9_5=vec2(l9_4.x ? vec2(1.0,0.0).x : vec2(0.0,1.0).x,l9_4.y ? vec2(1.0,0.0).y : vec2(0.0,1.0).y);
vec2 l9_6=(l9_1+vec2(0.21132487))-l9_5;
vec2 l9_7=l9_1+vec2(-0.57735026);
vec2 l9_8=l9_0-(floor(l9_0*0.0034602077)*289.0);
vec3 l9_9=vec3(l9_8.y)+vec3(0.0,l9_5.y,1.0);
vec3 l9_10=((l9_9*34.0)+vec3(1.0))*l9_9;
vec3 l9_11=((l9_10-(floor(l9_10*0.0034602077)*289.0))+vec3(l9_8.x))+vec3(0.0,l9_5.x,1.0);
vec3 l9_12=((l9_11*34.0)+vec3(1.0))*l9_11;
vec3 l9_13=max(vec3(0.5)-vec3(dot(l9_1,l9_1),dot(l9_6,l9_6),dot(l9_7,l9_7)),vec3(0.0));
vec3 l9_14=l9_13*l9_13;
vec3 l9_15=(fract((l9_12-(floor(l9_12*0.0034602077)*289.0))*vec3(0.024390243))*2.0)-vec3(1.0);
vec3 l9_16=abs(l9_15)-vec3(0.5);
vec3 l9_17=l9_15-floor(l9_15+vec3(0.5));
vec3 l9_18=vec3(0.0);
l9_18.x=(l9_17.x*l9_2)+(l9_16.x*l9_3);
vec2 l9_19=(l9_17.yz*vec2(l9_6.x,l9_7.x))+(l9_16.yz*vec2(l9_6.y,l9_7.y));
return 130.0*dot((l9_14*l9_14)*(vec3(1.7928429)-(((l9_17*l9_17)+(l9_16*l9_16))*0.85373473)),vec3(l9_18.x,l9_19.x,l9_19.y));
}
#else
{
return 0.0;
}
#endif
}
vec4 matrixToQuaternion(mat3 m)
{
float l9_0=m[0].x;
float l9_1=m[1].y;
float l9_2=m[2].z;
float l9_3=(l9_0-l9_1)-l9_2;
float l9_4=m[1].y;
float l9_5=m[0].x;
float l9_6=m[2].z;
float l9_7=(l9_4-l9_5)-l9_6;
float l9_8=m[2].z;
float l9_9=m[0].x;
float l9_10=m[1].y;
float l9_11=(l9_8-l9_9)-l9_10;
float l9_12=m[0].x;
float l9_13=m[1].y;
float l9_14=m[2].z;
float l9_15=(l9_12+l9_13)+l9_14;
float l9_16;
int l9_17;
if (l9_3>l9_15)
{
l9_17=1;
l9_16=l9_3;
}
else
{
l9_17=0;
l9_16=l9_15;
}
float l9_18;
int l9_19;
if (l9_7>l9_16)
{
l9_19=2;
l9_18=l9_7;
}
else
{
l9_19=l9_17;
l9_18=l9_16;
}
float l9_20;
int l9_21;
if (l9_11>l9_18)
{
l9_21=3;
l9_20=l9_11;
}
else
{
l9_21=l9_19;
l9_20=l9_18;
}
float l9_22=l9_20+1.0;
float l9_23=sqrt(l9_22)*0.5;
float l9_24=0.25/l9_23;
if (l9_21==0)
{
return vec4(l9_23,(m[1].z-m[2].y)*l9_24,(m[2].x-m[0].z)*l9_24,(m[0].y-m[1].x)*l9_24);
}
else
{
if (l9_21==1)
{
return vec4((m[1].z-m[2].y)*l9_24,l9_23,(m[0].y+m[1].x)*l9_24,(m[2].x+m[0].z)*l9_24);
}
else
{
if (l9_21==2)
{
return vec4((m[2].x-m[0].z)*l9_24,(m[0].y+m[1].x)*l9_24,l9_23,(m[1].z+m[2].y)*l9_24);
}
else
{
if (l9_21==3)
{
return vec4((m[0].y-m[1].x)*l9_24,(m[2].x+m[0].z)*l9_24,(m[1].z+m[2].y)*l9_24,l9_23);
}
else
{
return vec4(1.0,0.0,0.0,0.0);
}
}
}
}
}
void main()
{
bool l9_0=ssDecodeParticle(sc_GetLocalInstanceID());
bool l9_1=overrideTimeEnabled==1;
float l9_2;
if (l9_1)
{
l9_2=overrideTimeElapsed;
}
else
{
l9_2=sc_Time.x;
}
float l9_3;
if (l9_1)
{
l9_3=overrideTimeDelta;
}
else
{
l9_3=max(sc_Time.y,0.0);
}
float l9_4=gParticle.TimeShift;
float l9_5=l9_4*l9_3;
float l9_6=l9_2-l9_5;
float l9_7=l9_6-0.0;
gParticle.Age=mod((l9_7-gParticle.SpawnOffset)+0.0,0.2);
float l9_8=gParticle.SpawnOffset;
float l9_9=l9_2-l9_8;
bool l9_10=l9_9<(0.0-0.0);
bool l9_11;
if (!l9_10)
{
l9_11=gParticle.Age>0.2;
}
else
{
l9_11=l9_10;
}
bool l9_12=l9_11 ? true : false;
bool l9_13=!l9_12;
bool l9_14;
if (l9_13)
{
l9_14=gParticle.Life<=9.9999997e-05;
}
else
{
l9_14=l9_13;
}
bool l9_15;
if (!l9_14)
{
l9_15=mod(((max(l9_2,0.1)-gParticle.SpawnOffset)-0.0)+0.0,0.2)<=l9_3;
}
else
{
l9_15=l9_14;
}
if (l9_15)
{
ssGlobals l9_16=ssGlobals(l9_2,l9_3,l9_7);
ssCalculateParticleSeed(gParticle);
float l9_18=floor(6.0);
gParticle.Position=(vec3(((floor(mod(gParticle.Index1DPerCopyF,l9_18))/6.0)*2.0)-1.0,((floor(gParticle.Index1DPerCopyF/l9_18)/6.0)*2.0)-1.0,0.0)*20.0)+vec3(1.0,1.0,0.0);
gParticle.Velocity=vec3(0.0);
gParticle.Color=vec4(1.0);
gParticle.Age=0.0;
gParticle.Life=0.2;
gParticle.Size=1.0;
gParticle.Mass=1.0;
gParticle.Matrix=mat3(vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),vec3(0.0,0.0,1.0));
gParticle.Quaternion=vec4(0.0,0.0,0.0,1.0);
float l9_19;
if ((float(0.0==Port_Input1_N149)*1.0)!=0.0)
{
vec3 l9_20;
Node150_Particle_Random(Port_Min_N150,Port_Max_N150,l9_20,l9_16);
vec3 l9_21=l9_20;
float l9_22=1.0-clamp(Port_Import_N151,0.0,1.0);
float l9_23;
if (l9_22<=0.0)
{
l9_23=0.0;
}
else
{
l9_23=pow(l9_22,Port_Input1_N153);
}
vec3 l9_24;
Node154_Particle_Random(vec3(l9_23),Port_Max_N154,l9_24,l9_16);
vec3 l9_25=l9_24;
float l9_26;
if (l9_25.x<=0.0)
{
l9_26=0.0;
}
else
{
l9_26=sqrt(l9_25.x);
}
float l9_27;
if (l9_26<=0.0)
{
l9_27=0.0;
}
else
{
l9_27=sqrt(l9_26);
}
l9_19=abs(((((l9_21/(vec3(length(l9_21))+vec3(1.234e-06)))*vec3(l9_27,0.0,0.0))*vec3(Port_Import_N157))*Port_Import_N158).x);
}
else
{
vec3 l9_28;
Node150_Particle_Random(Port_Min_N150,Port_Max_N150,l9_28,l9_16);
vec3 l9_29=l9_28;
float l9_30=1.0-clamp(Port_Import_N151,0.0,1.0);
float l9_31;
if (l9_30<=0.0)
{
l9_31=0.0;
}
else
{
l9_31=pow(l9_30,Port_Input1_N153);
}
vec3 l9_32;
Node154_Particle_Random(vec3(l9_31),Port_Max_N154,l9_32,l9_16);
vec3 l9_33=l9_32;
float l9_34;
if (l9_33.x<=0.0)
{
l9_34=0.0;
}
else
{
l9_34=sqrt(l9_33.x);
}
float l9_35;
if (l9_34<=0.0)
{
l9_35=0.0;
}
else
{
l9_35=sqrt(l9_34);
}
l9_19=((((l9_29/(vec3(length(l9_29))+vec3(1.234e-06)))*vec3(l9_35,0.0,0.0))*vec3(Port_Import_N157))*Port_Import_N158).x;
}
float l9_36;
if ((float(0.0==Port_Input1_N162)*1.0)!=0.0)
{
vec3 l9_37;
Node150_Particle_Random(Port_Min_N150,Port_Max_N150,l9_37,l9_16);
vec3 l9_38=l9_37;
float l9_39=1.0-clamp(Port_Import_N151,0.0,1.0);
float l9_40;
if (l9_39<=0.0)
{
l9_40=0.0;
}
else
{
l9_40=pow(l9_39,Port_Input1_N153);
}
vec3 l9_41;
Node154_Particle_Random(vec3(l9_40),Port_Max_N154,l9_41,l9_16);
vec3 l9_42=l9_41;
float l9_43;
if (l9_42.y<=0.0)
{
l9_43=0.0;
}
else
{
l9_43=sqrt(l9_42.y);
}
float l9_44;
if (l9_43<=0.0)
{
l9_44=0.0;
}
else
{
l9_44=sqrt(l9_43);
}
l9_36=abs(((((l9_38/(vec3(length(l9_38))+vec3(1.234e-06)))*vec3(0.0,l9_44,0.0))*vec3(Port_Import_N157))*Port_Import_N158).y);
}
else
{
vec3 l9_45;
Node150_Particle_Random(Port_Min_N150,Port_Max_N150,l9_45,l9_16);
vec3 l9_46=l9_45;
float l9_47=1.0-clamp(Port_Import_N151,0.0,1.0);
float l9_48;
if (l9_47<=0.0)
{
l9_48=0.0;
}
else
{
l9_48=pow(l9_47,Port_Input1_N153);
}
vec3 l9_49;
Node154_Particle_Random(vec3(l9_48),Port_Max_N154,l9_49,l9_16);
vec3 l9_50=l9_49;
float l9_51;
if (l9_50.y<=0.0)
{
l9_51=0.0;
}
else
{
l9_51=sqrt(l9_50.y);
}
float l9_52;
if (l9_51<=0.0)
{
l9_52=0.0;
}
else
{
l9_52=sqrt(l9_51);
}
l9_36=((((l9_46/(vec3(length(l9_46))+vec3(1.234e-06)))*vec3(0.0,l9_52,0.0))*vec3(Port_Import_N157))*Port_Import_N158).y;
}
float l9_53;
if ((float(0.0==Port_Input1_N165)*1.0)!=0.0)
{
vec3 l9_54;
Node150_Particle_Random(Port_Min_N150,Port_Max_N150,l9_54,l9_16);
vec3 l9_55=l9_54;
float l9_56=1.0-clamp(Port_Import_N151,0.0,1.0);
float l9_57;
if (l9_56<=0.0)
{
l9_57=0.0;
}
else
{
l9_57=pow(l9_56,Port_Input1_N153);
}
vec3 l9_58;
Node154_Particle_Random(vec3(l9_57),Port_Max_N154,l9_58,l9_16);
vec3 l9_59=l9_58;
float l9_60;
if (l9_59.z<=0.0)
{
l9_60=0.0;
}
else
{
l9_60=sqrt(l9_59.z);
}
float l9_61;
if (l9_60<=0.0)
{
l9_61=0.0;
}
else
{
l9_61=sqrt(l9_60);
}
l9_53=abs(((((l9_55/(vec3(length(l9_55))+vec3(1.234e-06)))*vec3(0.0,0.0,l9_61))*vec3(Port_Import_N157))*Port_Import_N158).z);
}
else
{
vec3 l9_62;
Node150_Particle_Random(Port_Min_N150,Port_Max_N150,l9_62,l9_16);
vec3 l9_63=l9_62;
float l9_64=1.0-clamp(Port_Import_N151,0.0,1.0);
float l9_65;
if (l9_64<=0.0)
{
l9_65=0.0;
}
else
{
l9_65=pow(l9_64,Port_Input1_N153);
}
vec3 l9_66;
Node154_Particle_Random(vec3(l9_65),Port_Max_N154,l9_66,l9_16);
vec3 l9_67=l9_66;
float l9_68;
if (l9_67.z<=0.0)
{
l9_68=0.0;
}
else
{
l9_68=sqrt(l9_67.z);
}
float l9_69;
if (l9_68<=0.0)
{
l9_69=0.0;
}
else
{
l9_69=sqrt(l9_68);
}
l9_53=((((l9_63/(vec3(length(l9_63))+vec3(1.234e-06)))*vec3(0.0,0.0,l9_69))*vec3(Port_Import_N157))*Port_Import_N158).z;
}
gParticle.Position=Port_Import_N216+vec3(l9_19,l9_36,l9_53);
float l9_70;
if ((1.0*1.0)!=0.0)
{
float l9_71;
Node44_Particle_Random(Port_Import_N042,Port_Import_N043,l9_71,l9_16);
l9_70=l9_71/(length(vfxLocalAabbMax-vfxLocalAabbMin)+1.234e-06);
}
else
{
float l9_72;
Node44_Particle_Random(Port_Import_N042,Port_Import_N043,l9_72,l9_16);
l9_70=l9_72;
}
gParticle.Size=l9_70;
gParticle.Mass=mix(Port_Import_N023,Port_Import_N024,ssGetParticleRandom(1,false,true,true,26.0,gParticle,0.0,l9_2).x);
gParticle.Mass=max(9.9999997e-06,gParticle.Mass);
vec3 l9_73=gParticle.Position;
vec3 l9_74=Port_Import_N054-l9_73;
float l9_75=dot(l9_74,l9_74);
float l9_76;
if (l9_75>0.0)
{
l9_76=1.0/sqrt(l9_75);
}
else
{
l9_76=0.0;
}
gParticle.Force+=(vec3(Port_Import_N053)*(l9_74*l9_76));
float l9_77=dot(Port_Import_N187,Port_Import_N187);
float l9_78;
if (l9_77>0.0)
{
l9_78=1.0/sqrt(l9_77);
}
else
{
l9_78=0.0;
}
gParticle.Force+=((Port_Import_N187*l9_78)*vec3(particles_speed));
if ((float(clamp(gParticle.Age/gParticle.Life,0.0,1.0)>(1.0-particlesReduce))*1.0)!=0.0)
{
gParticle.Dead=true;
}
gParticle.Velocity+=((gParticle.Force/vec3(gParticle.Mass))*0.033330001);
gParticle.Force=vec3(0.0);
gParticle.Position=(vfxModelMatrix[sc_GetLocalInstanceID()/40]*vec4(gParticle.Position,1.0)).xyz;
int l9_79=sc_GetLocalInstanceID()/40;
gParticle.Velocity=mat3(vfxModelMatrix[l9_79][0].xyz,vfxModelMatrix[l9_79][1].xyz,vfxModelMatrix[l9_79][2].xyz)*gParticle.Velocity;
int l9_80=sc_GetLocalInstanceID()/40;
gParticle.Force=mat3(vfxModelMatrix[l9_80][0].xyz,vfxModelMatrix[l9_80][1].xyz,vfxModelMatrix[l9_80][2].xyz)*gParticle.Force;
gParticle.Size=max(length(vfxModelMatrix[sc_GetLocalInstanceID()/40][0].xyz),max(length(vfxModelMatrix[sc_GetLocalInstanceID()/40][1].xyz),length(vfxModelMatrix[sc_GetLocalInstanceID()/40][2].xyz)))*gParticle.Size;
int l9_81=sc_GetLocalInstanceID()/40;
gParticle.Matrix=mat3(vfxModelMatrix[l9_81][0].xyz,vfxModelMatrix[l9_81][1].xyz,vfxModelMatrix[l9_81][2].xyz)*gParticle.Matrix;
gParticle.Spawned=true;
}
if (gParticle.Dead)
{
sc_SetClipPosition(vec4(4334.0,4334.0,4334.0,0.0));
return;
}
vec3 l9_82=mix(Port_Import_N142,Port_Import_N006,vec3(clamp(gParticle.Age/gParticle.Life,0.0,1.0)));
vec4 l9_83=vec4(l9_82.x,l9_82.y,l9_82.z,vec4(0.0).w);
l9_83.w=gParticle.Color.w;
gParticle.Color=l9_83;
vec3 l9_84=((gParticle.Position+Port_Import_N208)+(Port_Import_N318*vec3(l9_7*Port_Multiplier_N319)))*(vec3(1.0)/Port_Import_N322);
vec2 l9_85=vec2(l9_84.xy)+Port_Input1_N326;
vec2 l9_86=vec2(l9_84.yz)+Port_Input1_N329;
vec2 l9_87=vec2(l9_84.zx)+Port_Input1_N332;
gParticle.Force+=(vec3(Tweak_N12,Tweak_N12/(Port_Input1_N014+1.234e-06),Tweak_N12)*((vec3(floor(((snoise(vec2(floor(l9_85.x*10000.0)*9.9999997e-05,floor(l9_85.y*10000.0)*9.9999997e-05)*(Port_Scale_N327*0.5))*0.5)+0.5)*10000.0)*9.9999997e-05,floor(((snoise(vec2(floor(l9_86.x*10000.0)*9.9999997e-05,floor(l9_86.y*10000.0)*9.9999997e-05)*(Port_Scale_N330*0.5))*0.5)+0.5)*10000.0)*9.9999997e-05,floor(((snoise(vec2(floor(l9_87.x*10000.0)*9.9999997e-05,floor(l9_87.y*10000.0)*9.9999997e-05)*(Port_Scale_N333*0.5))*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N335)-vec3(1.0)));
vec3 l9_88=abs(gParticle.Velocity*vec3(gParticle.Mass))/(vec3(l9_3*Port_Multiplier_N272)+vec3(1.234e-06));
gParticle.Force+=clamp((((vec3(Port_Import_N126)*vec3(Port_Import_N127))*vec3(Port_Import_N128))*((-gParticle.Velocity)*vec3(length(gParticle.Velocity))))*vec3(Port_Input4_N137),-l9_88,l9_88);
vec3 l9_89=Port_Import_N112+vec3(Port_Value1_N213,Port_Value2_N213,Port_Value3_N213);
vec3 l9_90=gParticle.Velocity;
vec3 l9_91=gParticle.Force;
vec3 l9_92=gParticle.Position;
vec3 l9_93=vec3(l9_3);
vec3 l9_94=normalize(Port_Import_N113);
vec3 l9_95;
vec3 l9_96;
vec3 l9_97;
bool l9_98;
if ((dot(l9_94,(((gParticle.Velocity+((gParticle.Force/vec3(max(9.9999997e-06,gParticle.Mass)))*l9_93))*l9_93)+gParticle.Position)-l9_89)-Port_Import_N116)<0.0)
{
vec3 l9_99=l9_94*dot(l9_94,gParticle.Velocity);
vec3 l9_100=((gParticle.Velocity-l9_99)*(1.0-clamp(Port_Import_N115,0.0,1.0)))-(l9_99*clamp(Port_Import_N114,0.0,1.0));
l9_98=true;
l9_97=l9_100;
l9_96=l9_92+(l9_94*(-(dot(l9_94,gParticle.Position-l9_89)-Port_Import_N116)));
l9_95=l9_91*float(length(l9_100)>Port_VelocityThreshold_N118);
}
else
{
l9_98=false;
l9_97=l9_90;
l9_96=l9_92;
l9_95=l9_91;
}
float l9_101=floor(Port_CollisionCount_N118);
float l9_102;
if (l9_98)
{
l9_102=l9_101+1.0;
}
else
{
l9_102=l9_101;
}
if (gParticle.Spawned)
{
gParticle.collisionCount_N119=Port_DefaultFloat_N119;
}
else
{
gParticle.collisionCount_N119=l9_102;
}
gParticle.Force=l9_95;
gParticle.Velocity=l9_97;
gParticle.Position=l9_96;
if ((0.0*1.0)!=0.0)
{
gParticle.Dead=true;
}
gParticle.Size=(clamp(sin((1.0-clamp(gParticle.Age/gParticle.Life,0.0,1.0))*Port_Input1_N171)+0.001,Port_Input1_N109+0.001,Port_Input2_N109+0.001)-0.001)*particle_scale;
if ((float(clamp(gParticle.Age/gParticle.Life,0.0,1.0)>(1.0-particlesReduce))*1.0)!=0.0)
{
gParticle.Dead=true;
}
gParticle.Quaternion=matrixToQuaternion(gParticle.Matrix);
float l9_103=clamp(l9_3,9.9999997e-05,0.5);
if (gParticle.Dead)
{
sc_SetClipPosition(vec4(4334.0,4334.0,4334.0,0.0));
return;
}
float l9_104;
if (abs(gParticle.Force.x)<0.0049999999)
{
l9_104=0.0;
}
else
{
l9_104=gParticle.Force.x;
}
gParticle.Force.x=l9_104;
float l9_105;
if (abs(gParticle.Force.y)<0.0049999999)
{
l9_105=0.0;
}
else
{
l9_105=gParticle.Force.y;
}
gParticle.Force.y=l9_105;
float l9_106;
if (abs(gParticle.Force.z)<0.0049999999)
{
l9_106=0.0;
}
else
{
l9_106=gParticle.Force.z;
}
gParticle.Force.z=l9_106;
gParticle.Mass=max(0.0049999999,gParticle.Mass);
gParticle.Velocity+=((gParticle.Force/vec3(gParticle.Mass))*l9_103);
float l9_107;
if (abs(gParticle.Velocity.x)<0.0049999999)
{
l9_107=0.0;
}
else
{
l9_107=gParticle.Velocity.x;
}
gParticle.Velocity.x=l9_107;
float l9_108;
if (abs(gParticle.Velocity.y)<0.0049999999)
{
l9_108=0.0;
}
else
{
l9_108=gParticle.Velocity.y;
}
gParticle.Velocity.y=l9_108;
float l9_109;
if (abs(gParticle.Velocity.z)<0.0049999999)
{
l9_109=0.0;
}
else
{
l9_109=gParticle.Velocity.z;
}
gParticle.Velocity.z=l9_109;
gParticle.Position+=(gParticle.Velocity*l9_103);
vec2 l9_110=vec2(4.0,1.0)/vec2(2048.0,vfxTargetSizeWrite.y);
int l9_111=vfxOffsetInstancesWrite+sc_GetLocalInstanceID();
float l9_112;
if (texture0.x<0.5)
{
l9_112=0.0;
}
else
{
l9_112=l9_110.x;
}
float l9_113;
if (texture0.y<0.5)
{
l9_113=0.0;
}
else
{
l9_113=l9_110.y;
}
sc_SetClipPosition(vec4(((vec2(l9_112,l9_113)+(vec2(float(l9_111%512),float(l9_111/512))*l9_110))*2.0)-vec2(1.0),1.0,1.0));
Interp_Particle_Index=float(sc_GetLocalInstanceID());
Interp_Particle_Coord=texture0;
Interp_Particle_Force=gParticle.Force;
Interp_Particle_SpawnIndex=gParticle.SpawnIndex;
Interp_Particle_NextBurstTime=gParticle.NextBurstTime;
Interp_Particle_Position=gParticle.Position;
Interp_Particle_Velocity=gParticle.Velocity;
Interp_Particle_Life=gParticle.Life;
Interp_Particle_Age=gParticle.Age;
Interp_Particle_Size=gParticle.Size;
Interp_Particle_Color=gParticle.Color;
Interp_Particle_Quaternion=gParticle.Quaternion;
Interp_Particle_collisionCount_N119=gParticle.collisionCount_N119;
Interp_Particle_Mass=gParticle.Mass;
if (gParticle.Dead)
{
sc_SetClipPosition(vec4(4334.0,4334.0,4334.0,0.0));
return;
}
if (l9_1&&(overrideTimeDelta==0.0))
{
vec4 l9_114;
if (sc_GetLocalInstanceID()==0)
{
l9_114=vec4((texture0*2.0)-vec2(1.0),1.0,1.0);
}
else
{
l9_114=vec4(0.0);
}
sc_SetClipPosition(l9_114);
varPackedTex=vec4(texture0.x,texture0.y,varPackedTex.z,varPackedTex.w);
}
}
#elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
#define SC_DISABLE_FRUSTUM_CULLING
#define SC_ALLOW_16_TEXTURES
#define SC_ENABLE_INSTANCED_RENDERING
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
#ifndef sc_NumStereoViews
#define sc_NumStereoViews 1
#endif
#ifndef sc_StereoRendering_IsClipDistanceEnabled
#define sc_StereoRendering_IsClipDistanceEnabled 0
#endif
#ifndef renderTarget0HasSwappedViews
#define renderTarget0HasSwappedViews 0
#elif renderTarget0HasSwappedViews==1
#undef renderTarget0HasSwappedViews
#define renderTarget0HasSwappedViews 1
#endif
#ifndef renderTarget0Layout
#define renderTarget0Layout 0
#endif
#ifndef renderTarget1HasSwappedViews
#define renderTarget1HasSwappedViews 0
#elif renderTarget1HasSwappedViews==1
#undef renderTarget1HasSwappedViews
#define renderTarget1HasSwappedViews 1
#endif
#ifndef renderTarget1Layout
#define renderTarget1Layout 0
#endif
#ifndef renderTarget2HasSwappedViews
#define renderTarget2HasSwappedViews 0
#elif renderTarget2HasSwappedViews==1
#undef renderTarget2HasSwappedViews
#define renderTarget2HasSwappedViews 1
#endif
#ifndef renderTarget2Layout
#define renderTarget2Layout 0
#endif
#ifndef renderTarget3HasSwappedViews
#define renderTarget3HasSwappedViews 0
#elif renderTarget3HasSwappedViews==1
#undef renderTarget3HasSwappedViews
#define renderTarget3HasSwappedViews 1
#endif
#ifndef renderTarget3Layout
#define renderTarget3Layout 0
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
uniform mat4 sc_ViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameModelMatrix;
uniform mat4 sc_ModelMatrixInverse;
uniform vec4 intensityTextureDims;
uniform float correctedIntensity;
uniform mat3 intensityTextureTransform;
uniform vec4 intensityTextureUvMinMax;
uniform vec4 intensityTextureBorderColor;
uniform vec4 renderTarget0Dims;
uniform vec4 renderTarget1Dims;
uniform vec4 renderTarget2Dims;
uniform vec4 renderTarget3Dims;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform int vfxOffsetInstancesRead;
uniform int vfxTargetWidth;
uniform vec2 vfxTargetSizeRead;
uniform bool vfxBatchEnable[32];
uniform float overrideTimeDelta;
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
uniform mat4 sc_ModelMatrix;
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
uniform float _sc_GetFramebufferColorInvalidUsageMarker;
uniform float sc_DisableFrustumCullingMarker;
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
uniform int vfxNumCopies;
uniform bool vfxEmitParticle[32];
uniform mat4 vfxModelMatrix[32];
uniform vec4 renderTarget0Size;
uniform vec4 renderTarget0View;
uniform vec4 renderTarget1Size;
uniform vec4 renderTarget1View;
uniform vec4 renderTarget2Size;
uniform vec4 renderTarget2View;
uniform vec4 renderTarget3Size;
uniform vec4 renderTarget3View;
uniform vec3 vfxLocalAabbMin;
uniform vec3 vfxLocalAabbMax;
uniform float vfxCameraAspect;
uniform float vfxCameraNear;
uniform float vfxCameraFar;
uniform vec3 vfxCameraUp;
uniform vec3 vfxCameraForward;
uniform vec3 vfxCameraRight;
uniform mat4 vfxProjectionMatrix;
uniform mat4 vfxProjectionMatrixInverse;
uniform mat4 vfxViewMatrix;
uniform mat4 vfxViewMatrixInverse;
uniform mat4 vfxViewProjectionMatrix;
uniform mat4 vfxViewProjectionMatrixInverse;
uniform int vfxFrame;
uniform int vfxOffsetInstancesWrite;
uniform vec2 vfxTargetSizeWrite;
uniform float particles_speed;
uniform float particlesReduce;
uniform float Tweak_N12;
uniform float particle_scale;
uniform vec3 Port_Import_N216;
uniform float Port_Input1_N149;
uniform vec3 Port_Min_N150;
uniform vec3 Port_Max_N150;
uniform float Port_Import_N151;
uniform float Port_Input1_N153;
uniform vec3 Port_Max_N154;
uniform float Port_Import_N157;
uniform vec3 Port_Import_N158;
uniform float Port_Input1_N162;
uniform float Port_Input1_N165;
uniform float Port_Import_N042;
uniform float Port_Import_N043;
uniform float Port_Import_N023;
uniform float Port_Import_N024;
uniform float Port_Import_N053;
uniform vec3 Port_Import_N054;
uniform vec3 Port_Import_N187;
uniform float Port_Import_N189;
uniform vec3 Port_Import_N142;
uniform vec3 Port_Import_N006;
uniform float Port_Input1_N014;
uniform vec3 Port_Import_N206;
uniform vec3 Port_Import_N208;
uniform vec3 Port_Import_N318;
uniform float Port_Multiplier_N319;
uniform vec3 Port_Import_N322;
uniform vec2 Port_Input1_N326;
uniform vec2 Port_Scale_N327;
uniform vec2 Port_Input1_N329;
uniform vec2 Port_Scale_N330;
uniform vec2 Port_Input1_N332;
uniform vec2 Port_Scale_N333;
uniform vec3 Port_Input1_N335;
uniform float Port_Import_N126;
uniform float Port_Import_N127;
uniform float Port_Import_N128;
uniform float Port_Input4_N137;
uniform float Port_Multiplier_N272;
uniform vec3 Port_Import_N112;
uniform float Port_Value1_N213;
uniform float Port_Value2_N213;
uniform float Port_Value3_N213;
uniform vec3 Port_Import_N113;
uniform float Port_Import_N114;
uniform float Port_Import_N115;
uniform float Port_Import_N116;
uniform float Port_CollisionCount_N118;
uniform float Port_VelocityThreshold_N118;
uniform float Port_DefaultFloat_N119;
uniform float Port_Input1_N171;
uniform float Port_Input1_N109;
uniform float Port_Input2_N109;
uniform float Port_Input1_N184;
uniform vec4 Port_Value0_N176;
uniform float Port_Position1_N176;
uniform vec4 Port_Value1_N176;
uniform float Port_Position2_N176;
uniform vec4 Port_Value2_N176;
uniform float Port_Position3_N176;
uniform vec4 Port_Value3_N176;
uniform vec4 Port_Value4_N176;
uniform sampler2D renderTarget0;
uniform sampler2D renderTarget1;
uniform sampler2D renderTarget2;
uniform sampler2D renderTarget3;
varying float varStereoViewID;
varying vec2 varShadowTex;
varying float varClipDistance;
varying float Interp_Particle_Index;
varying vec4 varPackedTex;
varying vec3 Interp_Particle_Position;
varying vec3 Interp_Particle_Velocity;
varying float Interp_Particle_Life;
varying float Interp_Particle_Age;
varying float Interp_Particle_Size;
varying vec4 Interp_Particle_Color;
varying vec4 Interp_Particle_Quaternion;
varying float Interp_Particle_collisionCount_N119;
varying float Interp_Particle_Mass;
varying float Interp_Particle_SpawnIndex;
varying float Interp_Particle_NextBurstTime;
varying vec2 Interp_Particle_Coord;
varying vec3 varPos;
varying vec3 varNormal;
varying vec4 varTangent;
varying vec4 varScreenPos;
varying vec2 varScreenTexturePos;
varying vec4 varColor;
varying vec3 Interp_Particle_Force;
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
int renderTarget0GetStereoViewIndex()
{
int l9_0;
#if (renderTarget0HasSwappedViews)
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
vec4 renderTarget0SampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
return texture2D(renderTarget0,sc_SamplingCoordsViewToGlobal(uv,renderTarget0Layout,viewIndex).xy,bias);
}
int renderTarget1GetStereoViewIndex()
{
int l9_0;
#if (renderTarget1HasSwappedViews)
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
vec4 renderTarget1SampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
return texture2D(renderTarget1,sc_SamplingCoordsViewToGlobal(uv,renderTarget1Layout,viewIndex).xy,bias);
}
int renderTarget2GetStereoViewIndex()
{
int l9_0;
#if (renderTarget2HasSwappedViews)
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
vec4 renderTarget2SampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
return texture2D(renderTarget2,sc_SamplingCoordsViewToGlobal(uv,renderTarget2Layout,viewIndex).xy,bias);
}
int renderTarget3GetStereoViewIndex()
{
int l9_0;
#if (renderTarget3HasSwappedViews)
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
vec4 renderTarget3SampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
return texture2D(renderTarget3,sc_SamplingCoordsViewToGlobal(uv,renderTarget3Layout,viewIndex).xy,bias);
}
vec4 ssEncodeFloat32(float Value,float Min,float Max,float RemapRange)
{
vec4 l9_0=fract(vec4(1.0,255.0,65025.0,16581375.0)*(0.0+(((clamp(Value,Min,Max)-Min)*(RemapRange-0.0))/(Max-Min))));
return l9_0-(l9_0.yzww*vec4(0.0039215689,0.0039215689,0.0039215689,0.0));
}
vec2 ssEncodeFloat16(float Value,float Min,float Max,float RemapRange)
{
vec4 l9_0=fract(vec4(1.0,255.0,65025.0,16581375.0)*(0.0+(((clamp(Value,Min,Max)-Min)*(RemapRange-0.0))/(Max-Min))));
return (l9_0-(l9_0.yzww*vec4(0.0039215689,0.0039215689,0.0039215689,0.0))).xy;
}
void sc_writeFragData0(vec4 col)
{
    col.x+=sc_UniformConstants.x*float(sc_ShaderCacheConstant);
    sc_FragData0=col;
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
void sc_writeFragData3(vec4 col)
{
#if sc_FragDataCount>=4
    sc_FragData3=col;
#endif
}
void main()
{
#if ((sc_StereoRenderingMode==1)&&(sc_StereoRendering_IsClipDistanceEnabled==0))
{
if (varClipDistance<0.0)
{
discard;
}
}
#endif
vec4 l9_0;
vec4 l9_1;
vec4 l9_2;
vec4 l9_3;
if ((overrideTimeEnabled==1)&&(overrideTimeDelta==0.0))
{
l9_3=renderTarget3SampleViewIndexBias(varPackedTex.xy,renderTarget3GetStereoViewIndex(),0.0);
l9_2=renderTarget2SampleViewIndexBias(varPackedTex.xy,renderTarget2GetStereoViewIndex(),0.0);
l9_1=renderTarget1SampleViewIndexBias(varPackedTex.xy,renderTarget1GetStereoViewIndex(),0.0);
l9_0=renderTarget0SampleViewIndexBias(varPackedTex.xy,renderTarget0GetStereoViewIndex(),0.0);
}
else
{
int l9_4=int(floor(Interp_Particle_Coord.x*4.0));
float l9_5;
float l9_6;
float l9_7;
float l9_8;
float l9_9;
float l9_10;
float l9_11;
float l9_12;
float l9_13;
float l9_14;
float l9_15;
float l9_16;
float l9_17;
float l9_18;
float l9_19;
float l9_20;
if (l9_4==0)
{
vec4 l9_21=ssEncodeFloat32(Interp_Particle_Position.x,-1000.0,1000.0,0.99998999);
vec4 l9_22=ssEncodeFloat32(Interp_Particle_Position.y,-1000.0,1000.0,0.99998999);
vec4 l9_23=ssEncodeFloat32(Interp_Particle_Position.z,-1000.0,1000.0,0.99998999);
vec4 l9_24=ssEncodeFloat32(Interp_Particle_Velocity.x,-1000.0,1000.0,0.99998999);
l9_20=l9_24.w;
l9_19=l9_24.z;
l9_18=l9_24.y;
l9_17=l9_24.x;
l9_16=l9_23.w;
l9_15=l9_23.z;
l9_14=l9_23.y;
l9_13=l9_23.x;
l9_12=l9_22.w;
l9_11=l9_22.z;
l9_10=l9_22.y;
l9_9=l9_22.x;
l9_8=l9_21.w;
l9_7=l9_21.z;
l9_6=l9_21.y;
l9_5=l9_21.x;
}
else
{
float l9_25;
float l9_26;
float l9_27;
float l9_28;
float l9_29;
float l9_30;
float l9_31;
float l9_32;
float l9_33;
float l9_34;
float l9_35;
float l9_36;
float l9_37;
float l9_38;
float l9_39;
float l9_40;
if (l9_4==1)
{
vec4 l9_41=ssEncodeFloat32(Interp_Particle_Velocity.y,-1000.0,1000.0,0.99998999);
vec4 l9_42=ssEncodeFloat32(Interp_Particle_Velocity.z,-1000.0,1000.0,0.99998999);
vec4 l9_43=ssEncodeFloat32(Interp_Particle_Life,0.0,0.2,0.99998999);
vec4 l9_44=ssEncodeFloat32(Interp_Particle_Age,0.0,0.2,0.99998999);
l9_40=l9_44.w;
l9_39=l9_44.z;
l9_38=l9_44.y;
l9_37=l9_44.x;
l9_36=l9_43.w;
l9_35=l9_43.z;
l9_34=l9_43.y;
l9_33=l9_43.x;
l9_32=l9_42.w;
l9_31=l9_42.z;
l9_30=l9_42.y;
l9_29=l9_42.x;
l9_28=l9_41.w;
l9_27=l9_41.z;
l9_26=l9_41.y;
l9_25=l9_41.x;
}
else
{
float l9_45;
float l9_46;
float l9_47;
float l9_48;
float l9_49;
float l9_50;
float l9_51;
float l9_52;
float l9_53;
float l9_54;
float l9_55;
float l9_56;
float l9_57;
float l9_58;
float l9_59;
float l9_60;
if (l9_4==2)
{
vec2 l9_61=ssEncodeFloat16(Interp_Particle_Size,0.0,100.0,0.99998999);
vec2 l9_62=ssEncodeFloat16(Interp_Particle_Quaternion.x,-1.0,1.0,0.99998999);
vec2 l9_63=ssEncodeFloat16(Interp_Particle_Quaternion.y,-1.0,1.0,0.99998999);
vec2 l9_64=ssEncodeFloat16(Interp_Particle_Quaternion.z,-1.0,1.0,0.99998999);
vec2 l9_65=ssEncodeFloat16(Interp_Particle_Quaternion.w,-1.0,1.0,0.99998999);
vec2 l9_66=ssEncodeFloat16(Interp_Particle_Mass,0.0,100.0,0.99998999);
l9_60=0.0+(((clamp(Interp_Particle_Color.w,0.0,1.00001)-0.0)*(1.0-0.0))/(1.00001-0.0));
l9_59=0.0+(((clamp(Interp_Particle_Color.z,0.0,1.00001)-0.0)*(1.0-0.0))/(1.00001-0.0));
l9_58=0.0+(((clamp(Interp_Particle_Color.y,0.0,1.00001)-0.0)*(1.0-0.0))/(1.00001-0.0));
l9_57=0.0+(((clamp(Interp_Particle_Color.x,0.0,1.00001)-0.0)*(1.0-0.0))/(1.00001-0.0));
l9_56=l9_66.y;
l9_55=l9_66.x;
l9_54=l9_65.y;
l9_53=l9_65.x;
l9_52=l9_64.y;
l9_51=l9_64.x;
l9_50=l9_63.y;
l9_49=l9_63.x;
l9_48=l9_62.y;
l9_47=l9_62.x;
l9_46=l9_61.y;
l9_45=l9_61.x;
}
else
{
float l9_67;
if (l9_4==3)
{
l9_67=0.0+(((clamp(Interp_Particle_collisionCount_N119,0.0,255.0)-0.0)*(1.0-0.0))/(255.0-0.0));
}
else
{
l9_67=0.0;
}
l9_60=0.0;
l9_59=0.0;
l9_58=0.0;
l9_57=0.0;
l9_56=0.0;
l9_55=0.0;
l9_54=0.0;
l9_53=0.0;
l9_52=0.0;
l9_51=0.0;
l9_50=0.0;
l9_49=0.0;
l9_48=0.0;
l9_47=0.0;
l9_46=0.0;
l9_45=l9_67;
}
l9_40=l9_60;
l9_39=l9_59;
l9_38=l9_58;
l9_37=l9_57;
l9_36=l9_56;
l9_35=l9_55;
l9_34=l9_54;
l9_33=l9_53;
l9_32=l9_52;
l9_31=l9_51;
l9_30=l9_50;
l9_29=l9_49;
l9_28=l9_48;
l9_27=l9_47;
l9_26=l9_46;
l9_25=l9_45;
}
l9_20=l9_40;
l9_19=l9_39;
l9_18=l9_38;
l9_17=l9_37;
l9_16=l9_36;
l9_15=l9_35;
l9_14=l9_34;
l9_13=l9_33;
l9_12=l9_32;
l9_11=l9_31;
l9_10=l9_30;
l9_9=l9_29;
l9_8=l9_28;
l9_7=l9_27;
l9_6=l9_26;
l9_5=l9_25;
}
vec4 l9_68=vec4(l9_5,l9_6,l9_7,l9_8);
vec4 l9_69=vec4(l9_9,l9_10,l9_11,l9_12);
vec4 l9_70=vec4(l9_13,l9_14,l9_15,l9_16);
vec4 l9_71=vec4(l9_17,l9_18,l9_19,l9_20);
vec4 l9_72;
if (dot(((l9_68+l9_69)+l9_70)+l9_71,vec4(0.23454))==0.34231836)
{
l9_72=l9_68+vec4(1e-06);
}
else
{
l9_72=l9_68;
}
l9_3=l9_71;
l9_2=l9_70;
l9_1=l9_69;
l9_0=l9_72;
}
sc_writeFragData0(l9_0);
sc_writeFragData1(l9_1);
sc_writeFragData2(l9_2);
sc_writeFragData3(l9_3);
}
#endif // #elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
