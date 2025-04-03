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
//sampler sampler Tweak_N59SmpSC 0:18
//sampler sampler intensityTextureSmpSC 0:19
//sampler sampler opacityTextureASmpSC 0:20
//sampler sampler opacityTextureBSmpSC 0:21
//sampler sampler sc_EnvmapDiffuseSmpSC 0:22
//sampler sampler sc_EnvmapSpecularSmpSC 0:23
//sampler sampler sc_OITCommonSampler 0:24
//sampler sampler sc_SSAOTextureSmpSC 0:25
//sampler sampler sc_ScreenTextureSmpSC 0:26
//sampler sampler sc_ShadowTextureSmpSC 0:27
//texture texture2D Tweak_N59 0:0:0:18
//texture texture2D intensityTexture 0:1:0:19
//texture texture2D opacityTextureA 0:2:0:20
//texture texture2D opacityTextureB 0:3:0:21
//texture texture2D sc_EnvmapDiffuse 0:4:0:22
//texture texture2D sc_EnvmapSpecular 0:5:0:23
//texture texture2D sc_OITAlpha0 0:6:0:24
//texture texture2D sc_OITAlpha1 0:7:0:24
//texture texture2D sc_OITDepthHigh0 0:8:0:24
//texture texture2D sc_OITDepthHigh1 0:9:0:24
//texture texture2D sc_OITDepthLow0 0:10:0:24
//texture texture2D sc_OITDepthLow1 0:11:0:24
//texture texture2D sc_OITFilteredDepthBoundsTexture 0:12:0:24
//texture texture2D sc_OITFrontDepthTexture 0:13:0:24
//texture texture2D sc_SSAOTexture 0:14:0:25
//texture texture2D sc_ScreenTexture 0:15:0:26
//texture texture2D sc_ShadowTexture 0:16:0:27
//SG_REFLECTION_END
#if defined VERTEX_SHADER
#if 0
NGS_BACKEND_SHADER_FLAGS_BEGIN__
NGS_BACKEND_SHADER_FLAGS_END__
#endif
#define SC_DISABLE_FRUSTUM_CULLING
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
struct ssGlobals
{
float gTimeElapsed;
float gTimeDelta;
float gTimeElapsedShifted;
vec3 SurfacePosition_WorldSpace;
};
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
uniform vec4 Tweak_N59Dims;
uniform vec4 opacityTextureADims;
uniform vec4 opacityTextureBDims;
uniform float Tweak_N14;
uniform float scrollSpeed;
uniform float noiseScale;
uniform float Tweak_N11;
uniform float Tweak_N6;
uniform float Tweak_N37;
uniform float Port_Input1_N023;
uniform vec2 Port_Input1_N033;
uniform float Port_Input1_N025;
uniform float Port_Input1_N015;
uniform float Port_Input1_N016;
uniform float Port_Input1_N018;
uniform float Port_Input1_N021;
uniform float Port_Input1_N019;
uniform float Port_Input1_N030;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform float overrideTimeDelta;
uniform float Port_Input0_N032;
uniform float Port_Value1_N035;
uniform float Port_Value3_N035;
uniform float Port_Value4_N035;
uniform float Port_Value2_N109;
uniform float Port_Value3_N109;
uniform float Port_Value4_N109;
uniform float Port_Input1_N073;
uniform vec2 Port_Input1_N075;
uniform float Port_Input1_N077;
uniform float Port_Input1_N078;
uniform float Port_Input1_N080;
uniform float Port_Input1_N081;
uniform float Port_Input1_N083;
uniform float Port_Input1_N086;
uniform float Port_Input1_N088;
uniform float Port_Input0_N103;
uniform float Port_Value1_N104;
uniform float Port_Value3_N104;
uniform float Port_Value4_N104;
uniform float Port_Value1_N114;
uniform float Port_Value2_N114;
uniform float Port_Value4_N114;
uniform float Port_Input1_N131;
uniform vec2 Port_Input1_N133;
uniform float Port_Input1_N135;
uniform float Port_Input1_N136;
uniform float Port_Input1_N138;
uniform float Port_Input1_N139;
uniform float Port_Input1_N141;
uniform float Port_Input1_N144;
uniform float Port_Input1_N146;
uniform float Port_Input0_N161;
uniform float Port_Value1_N162;
uniform float Port_Value3_N162;
uniform float Port_Value4_N162;
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
uniform vec4 Tweak_N59Size;
uniform vec4 Tweak_N59View;
uniform mat3 Tweak_N59Transform;
uniform vec4 Tweak_N59UvMinMax;
uniform vec4 Tweak_N59BorderColor;
uniform vec4 opacityTextureASize;
uniform vec4 opacityTextureAView;
uniform mat3 opacityTextureATransform;
uniform vec4 opacityTextureAUvMinMax;
uniform vec4 opacityTextureABorderColor;
uniform vec4 opacityTextureBSize;
uniform vec4 opacityTextureBView;
uniform mat3 opacityTextureBTransform;
uniform vec4 opacityTextureBUvMinMax;
uniform vec4 opacityTextureBBorderColor;
uniform float Tweak_N171;
uniform float Tweak_N172;
uniform float Port_Import_N049;
uniform vec3 Port_Import_N051;
uniform vec3 Port_Import_N042;
uniform float Port_Import_N052;
uniform float Port_Import_N041;
uniform float Port_Import_N053;
uniform float Port_Import_N040;
uniform vec3 Port_Import_N044;
uniform float Port_Import_N054;
uniform float Port_Import_N046;
uniform float Port_Import_N055;
uniform float Port_Import_N047;
uniform float Port_Import_N063;
uniform vec3 Port_Import_N064;
uniform vec3 Port_Import_N068;
uniform float Port_Import_N065;
uniform float Port_Import_N070;
uniform float Port_Import_N066;
uniform float Port_Import_N074;
uniform vec3 Port_Import_N094;
uniform float Port_Import_N091;
uniform float Port_Import_N096;
uniform float Port_Import_N092;
uniform float Port_Import_N098;
uniform float Port_Import_N121;
uniform vec3 Port_Import_N122;
uniform vec3 Port_Import_N126;
uniform float Port_Import_N123;
uniform float Port_Import_N128;
uniform float Port_Import_N124;
uniform float Port_Import_N132;
uniform vec3 Port_Import_N152;
uniform float Port_Import_N149;
uniform float Port_Import_N154;
uniform float Port_Import_N150;
uniform float Port_Import_N156;
uniform float Port_Value2_N060;
uniform float Port_Value3_N060;
uniform float Port_Value4_N060;
uniform vec3 Port_Normal_N170;
uniform vec3 Port_Emissive_N170;
uniform vec3 Port_AO_N170;
uniform vec3 Port_SpecularAO_N170;
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
varying vec4 Interpolator0;
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
void Node24_Noise_Simplex(vec2 Seed,vec2 Scale,out float Noise,ssGlobals Globals)
{
Seed.x=floor(Seed.x*10000.0)*9.9999997e-05;
Seed.y=floor(Seed.y*10000.0)*9.9999997e-05;
Seed*=(Scale*0.5);
Noise=(snoise(Seed)*0.5)+0.5;
Noise=floor(Noise*10000.0)*9.9999997e-05;
}
void Node17_Noise_Simplex(vec2 Seed,vec2 Scale,out float Noise,ssGlobals Globals)
{
Seed.x=floor(Seed.x*10000.0)*9.9999997e-05;
Seed.y=floor(Seed.y*10000.0)*9.9999997e-05;
Seed*=(Scale*0.5);
Noise=(snoise(Seed)*0.5)+0.5;
Noise=floor(Noise*10000.0)*9.9999997e-05;
}
void Node20_Noise_Simplex(vec2 Seed,vec2 Scale,out float Noise,ssGlobals Globals)
{
Seed.x=floor(Seed.x*10000.0)*9.9999997e-05;
Seed.y=floor(Seed.y*10000.0)*9.9999997e-05;
Seed*=(Scale*0.5);
Noise=(snoise(Seed)*0.5)+0.5;
Noise=floor(Noise*10000.0)*9.9999997e-05;
}
void Node29_Noise_Simplex(vec2 Seed,vec2 Scale,out float Noise,ssGlobals Globals)
{
Seed.x=floor(Seed.x*10000.0)*9.9999997e-05;
Seed.y=floor(Seed.y*10000.0)*9.9999997e-05;
Seed*=(Scale*0.5);
Noise=(snoise(Seed)*0.5)+0.5;
Noise=floor(Noise*10000.0)*9.9999997e-05;
}
vec2 VoronoiHash2D(vec2 UV,float Offset)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
UV=fract(sin(mod(UV*mat2(vec2(0.15270001,0.4763),vec2(0.4991,0.8998)),vec2(3.1400001)))*0.32345);
return vec2((sin(UV.y*Offset)*0.5)+0.5,(cos(UV.x*Offset)*0.5)+0.5);
}
#else
{
return vec2(0.0);
}
#endif
}
void Node2_Voronoi_Noise(vec2 Seed,vec2 Scale,float Offset,out float Noise,out float Cells,ssGlobals Globals)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
Seed.x=floor(Seed.x*10000.0)*9.9999997e-05;
Seed.y=floor(Seed.y*10000.0)*9.9999997e-05;
vec2 l9_0=Seed;
vec2 l9_1=Scale;
vec2 l9_2=Seed;
vec2 l9_3=Scale;
vec3 l9_4;
l9_4=vec3(8.0,0.0,0.0);
vec3 l9_5;
int l9_6=-1;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_6<=1)
{
l9_5=l9_4;
vec3 l9_7;
int l9_8=-1;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_8<=1)
{
float l9_9=float(l9_8);
float l9_10=float(l9_6);
vec2 l9_11=vec2(l9_9,l9_10);
vec2 l9_12=VoronoiHash2D(l9_11+floor(l9_0*l9_1),abs(Offset)+1000.0);
float l9_13=distance(l9_11+l9_12,fract(l9_2*l9_3));
if (l9_13<l9_5.x)
{
float l9_14=l9_12.x;
Noise=l9_13;
Cells=l9_14;
Noise=floor(Noise*10000.0)*9.9999997e-05;
l9_7=vec3(l9_13,l9_14,0.0);
}
else
{
l9_7=l9_5;
}
l9_5=l9_7;
l9_8++;
continue;
}
else
{
break;
}
}
l9_6++;
l9_4=l9_5;
continue;
}
else
{
break;
}
}
}
#else
{
Noise=0.5;
Cells=0.5;
}
#endif
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
bool l9_30=overrideTimeEnabled==1;
float l9_31;
if (l9_30)
{
l9_31=overrideTimeElapsed;
}
else
{
l9_31=sc_Time.x;
}
float l9_32;
if (l9_30)
{
l9_32=overrideTimeDelta;
}
else
{
l9_32=sc_Time.y;
}
vec3 l9_33=varPos;
vec2 l9_34=vec2(l9_33.xz);
float l9_35=l9_31*scrollSpeed;
vec2 l9_36=vec2(l9_35);
vec2 l9_37=l9_34+l9_36;
vec2 l9_38=l9_37*vec2(Port_Input1_N023);
vec2 l9_39=vec2(noiseScale);
vec2 l9_40=l9_39*Port_Input1_N033;
ssGlobals l9_41=ssGlobals(l9_31,l9_32,0.0,l9_33);
float param_2;
Node24_Noise_Simplex(l9_38,l9_40,param_2,l9_41);
float l9_42=param_2;
vec2 l9_43=l9_37*vec2(Port_Input1_N015);
float param_6;
Node17_Noise_Simplex(l9_43,l9_40,param_6,l9_41);
float l9_44=param_6;
vec2 l9_45=l9_37*vec2(Port_Input1_N018);
float param_10;
Node20_Noise_Simplex(l9_45,l9_40,param_10,l9_41);
float l9_46=param_10;
vec2 l9_47=l9_37*vec2(Port_Input1_N019);
float param_14;
Node29_Noise_Simplex(l9_47,l9_40,param_14,l9_41);
float l9_48=param_14;
vec2 l9_49=vec2(Tweak_N11);
float l9_50=l9_31*Tweak_N6;
float param_19;
float param_20;
Node2_Voronoi_Noise(l9_34,l9_49,l9_50,param_19,param_20,l9_41);
float l9_51=param_19;
vec3 l9_52=l9_33+vec4(Tweak_N37,Port_Value2_N109,Port_Value3_N109,0.0).xyz;
float l9_53=l9_52.x;
vec2 l9_54=vec2(l9_53,l9_52.z)+l9_36;
vec2 l9_55=l9_54*vec2(Port_Input1_N073);
vec2 l9_56=(l9_39*Port_Input1_N075)*0.5;
float l9_57=snoise(vec2(floor(l9_55.x*10000.0)*9.9999997e-05,floor(l9_55.y*10000.0)*9.9999997e-05)*l9_56);
vec2 l9_58=l9_54*vec2(Port_Input1_N078);
float l9_59=snoise(vec2(floor(l9_58.x*10000.0)*9.9999997e-05,floor(l9_58.y*10000.0)*9.9999997e-05)*l9_56);
vec2 l9_60=l9_54*vec2(Port_Input1_N081);
float l9_61=snoise(vec2(floor(l9_60.x*10000.0)*9.9999997e-05,floor(l9_60.y*10000.0)*9.9999997e-05)*l9_56);
vec2 l9_62=l9_54*vec2(Port_Input1_N086);
float l9_63=snoise(vec2(floor(l9_62.x*10000.0)*9.9999997e-05,floor(l9_62.y*10000.0)*9.9999997e-05)*l9_56);
float l9_64;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
vec2 l9_65=vec2(floor(l9_53*10000.0)*9.9999997e-05,floor(l9_52.z*10000.0)*9.9999997e-05)*l9_49;
float l9_66;
vec3 l9_67;
l9_66=0.0;
l9_67=vec3(8.0,0.0,0.0);
vec3 l9_68;
float l9_69;
int l9_70=-1;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_70<=1)
{
l9_68=l9_67;
l9_69=l9_66;
float l9_71;
vec3 l9_72;
int l9_73=-1;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_73<=1)
{
float l9_74=float(l9_73);
float l9_75=float(l9_70);
vec2 l9_76=vec2(l9_74,l9_75);
vec2 l9_77=VoronoiHash2D(l9_76+floor(l9_65),abs(l9_50)+1000.0);
float l9_78=distance(l9_76+l9_77,fract(l9_65));
if (l9_78<l9_68.x)
{
l9_72=vec3(l9_78,0.0,0.0);
l9_71=floor(l9_78*10000.0)*9.9999997e-05;
}
else
{
l9_72=l9_68;
l9_71=l9_69;
}
l9_68=l9_72;
l9_73++;
l9_69=l9_71;
continue;
}
else
{
break;
}
}
l9_66=l9_69;
l9_70++;
l9_67=l9_68;
continue;
}
else
{
break;
}
}
l9_64=l9_66;
}
#else
{
l9_64=0.5;
}
#endif
float l9_79=((((floor(((l9_57*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N077)+(((floor(((l9_59*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N080)+((floor(((l9_61*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N083)))+((floor(((l9_63*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N088))*l9_64;
float param_24;
Node24_Noise_Simplex(l9_38,l9_40,param_24,l9_41);
float l9_80=param_24;
float param_28;
Node17_Noise_Simplex(l9_43,l9_40,param_28,l9_41);
float l9_81=param_28;
float param_32;
Node20_Noise_Simplex(l9_45,l9_40,param_32,l9_41);
float l9_82=param_32;
float param_36;
Node29_Noise_Simplex(l9_47,l9_40,param_36,l9_41);
float l9_83=param_36;
float param_41;
float param_42;
Node2_Voronoi_Noise(l9_34,l9_49,l9_50,param_41,param_42,l9_41);
float l9_84=param_41;
vec3 l9_85=vec4(Port_Value1_N035,mix(Port_Input0_N032,Tweak_N14,(((l9_80*Port_Input1_N025)+((l9_81*Port_Input1_N016)+(l9_82*Port_Input1_N021)))+(l9_83*Port_Input1_N030))*l9_84),Port_Value3_N035,0.0).xyz+l9_33;
vec3 l9_86=l9_33+vec4(Port_Value1_N114,Port_Value2_N114,Tweak_N37,0.0).xyz;
float l9_87=l9_86.x;
vec2 l9_88=vec2(l9_87,l9_86.z)+l9_36;
vec2 l9_89=l9_88*vec2(Port_Input1_N131);
vec2 l9_90=(l9_39*Port_Input1_N133)*0.5;
float l9_91=snoise(vec2(floor(l9_89.x*10000.0)*9.9999997e-05,floor(l9_89.y*10000.0)*9.9999997e-05)*l9_90);
vec2 l9_92=l9_88*vec2(Port_Input1_N136);
float l9_93=snoise(vec2(floor(l9_92.x*10000.0)*9.9999997e-05,floor(l9_92.y*10000.0)*9.9999997e-05)*l9_90);
vec2 l9_94=l9_88*vec2(Port_Input1_N139);
float l9_95=snoise(vec2(floor(l9_94.x*10000.0)*9.9999997e-05,floor(l9_94.y*10000.0)*9.9999997e-05)*l9_90);
vec2 l9_96=l9_88*vec2(Port_Input1_N144);
float l9_97=snoise(vec2(floor(l9_96.x*10000.0)*9.9999997e-05,floor(l9_96.y*10000.0)*9.9999997e-05)*l9_90);
float l9_98;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
vec2 l9_99=vec2(floor(l9_87*10000.0)*9.9999997e-05,floor(l9_86.z*10000.0)*9.9999997e-05)*l9_49;
float l9_100;
vec3 l9_101;
l9_100=0.0;
l9_101=vec3(8.0,0.0,0.0);
vec3 l9_102;
float l9_103;
int l9_104=-1;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_104<=1)
{
l9_102=l9_101;
l9_103=l9_100;
float l9_105;
vec3 l9_106;
int l9_107=-1;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_107<=1)
{
float l9_108=float(l9_107);
float l9_109=float(l9_104);
vec2 l9_110=vec2(l9_108,l9_109);
vec2 l9_111=VoronoiHash2D(l9_110+floor(l9_99),abs(l9_50)+1000.0);
float l9_112=distance(l9_110+l9_111,fract(l9_99));
if (l9_112<l9_102.x)
{
l9_106=vec3(l9_112,0.0,0.0);
l9_105=floor(l9_112*10000.0)*9.9999997e-05;
}
else
{
l9_106=l9_102;
l9_105=l9_103;
}
l9_102=l9_106;
l9_107++;
l9_103=l9_105;
continue;
}
else
{
break;
}
}
l9_100=l9_103;
l9_104++;
l9_101=l9_102;
continue;
}
else
{
break;
}
}
l9_98=l9_100;
}
#else
{
l9_98=0.5;
}
#endif
float l9_113=((((floor(((l9_91*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N135)+(((floor(((l9_93*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N138)+((floor(((l9_95*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N141)))+((floor(((l9_97*0.5)+0.5)*10000.0)*9.9999997e-05)*Port_Input1_N146))*l9_98;
vec3 l9_114=cross((vec4(Port_Value1_N104,mix(Port_Input0_N103,Tweak_N14,l9_79),Port_Value3_N104,0.0).xyz+l9_52)-l9_85,(vec4(Port_Value1_N162,mix(Port_Input0_N161,Tweak_N14,l9_113),Port_Value3_N162,0.0).xyz+l9_86)-l9_85);
float l9_115=dot(l9_114,l9_114);
float l9_116;
if (l9_115>0.0)
{
l9_116=1.0/sqrt(l9_115);
}
else
{
l9_116=0.0;
}
vec3 l9_117=l9_114*l9_116;
vec3 l9_118;
vec3 l9_119;
vec3 l9_120;
if (l9_27)
{
l9_120=varTangent.xyz;
l9_119=varNormal;
l9_118=varPos;
}
else
{
l9_120=varTangent.xyz;
l9_119=l9_117;
l9_118=vec4(Port_Value1_N035,mix(Port_Input0_N032,Tweak_N14,(((l9_42*Port_Input1_N025)+((l9_44*Port_Input1_N016)+(l9_46*Port_Input1_N021)))+(l9_48*Port_Input1_N030))*l9_51),Port_Value3_N035,0.0).xyz+l9_33;
}
varPos=l9_118;
varNormal=normalize(l9_119);
vec3 l9_121=normalize(l9_120);
varTangent=vec4(l9_121.x,l9_121.y,l9_121.z,varTangent.w);
varTangent.w=tangent.w;
#if (UseViewSpaceDepthVariant&&((sc_OITDepthGatherPass||sc_OITCompositingPass)||sc_OITDepthBoundsPass))
{
vec4 l9_122;
#if (sc_RenderingSpace==3)
{
l9_122=sc_ProjectionMatrixInverseArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
vec4 l9_123;
#if (sc_RenderingSpace==2)
{
l9_123=sc_ViewMatrixArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
vec4 l9_124;
#if (sc_RenderingSpace==1)
{
l9_124=sc_ModelViewMatrixArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
l9_124=l9_17;
}
#endif
l9_123=l9_124;
}
#endif
l9_122=l9_123;
}
#endif
varViewSpaceDepth=-l9_122.z;
}
#endif
vec4 l9_125;
#if (sc_RenderingSpace==3)
{
l9_125=l9_17;
}
#else
{
vec4 l9_126;
#if (sc_RenderingSpace==4)
{
l9_126=(sc_ModelViewMatrixArray[sc_GetStereoViewIndex()]*l9_17)*vec4(1.0/sc_Camera.aspect,1.0,1.0,1.0);
}
#else
{
vec4 l9_127;
#if (sc_RenderingSpace==2)
{
l9_127=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(varPos,1.0);
}
#else
{
vec4 l9_128;
#if (sc_RenderingSpace==1)
{
l9_128=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(varPos,1.0);
}
#else
{
l9_128=vec4(0.0);
}
#endif
l9_127=l9_128;
}
#endif
l9_126=l9_127;
}
#endif
l9_125=l9_126;
}
#endif
varPackedTex=vec4(l9_28,l9_2);
#if (sc_ProjectiveShadowsReceiver)
{
vec4 l9_129;
#if (sc_RenderingSpace==1)
{
l9_129=sc_ModelMatrix*l9_17;
}
#else
{
l9_129=l9_17;
}
#endif
vec4 l9_130=sc_ProjectorMatrix*l9_129;
varShadowTex=((l9_130.xy/vec2(l9_130.w))*0.5)+vec2(0.5);
}
#endif
vec4 l9_131;
#if (sc_DepthBufferMode==1)
{
vec4 l9_132;
if (sc_ProjectionMatrixArray[sc_GetStereoViewIndex()][2].w!=0.0)
{
vec4 l9_133=l9_125;
l9_133.z=((log2(max(sc_Camera.clipPlanes.x,1.0+l9_125.w))*(2.0/log2(sc_Camera.clipPlanes.y+1.0)))-1.0)*l9_125.w;
l9_132=l9_133;
}
else
{
l9_132=l9_125;
}
l9_131=l9_132;
}
#else
{
l9_131=l9_125;
}
#endif
vec4 l9_134;
#if (sc_ShaderCacheConstant!=0)
{
vec4 l9_135=l9_131;
l9_135.x=l9_131.x+(sc_UniformConstants.x*float(sc_ShaderCacheConstant));
l9_134=l9_135;
}
#else
{
l9_134=l9_131;
}
#endif
#if (sc_StereoRenderingMode>0)
{
varStereoViewID=float(sc_StereoViewID);
}
#endif
#if (sc_StereoRenderingMode==1)
{
float l9_136=dot(l9_134,sc_StereoClipPlanes[sc_StereoViewID]);
#if (sc_StereoRendering_IsClipDistanceEnabled==1)
{
sc_SetClipDistancePlatform(l9_136);
}
#else
{
varClipDistance=l9_136;
}
#endif
}
#endif
gl_Position=l9_134;
float l9_138;
Node24_Noise_Simplex(l9_38,l9_40,l9_138,l9_41);
float l9_139;
Node17_Noise_Simplex(l9_43,l9_40,l9_139,l9_41);
float l9_140;
Node20_Noise_Simplex(l9_45,l9_40,l9_140,l9_41);
float l9_141;
Node29_Noise_Simplex(l9_47,l9_40,l9_141,l9_41);
float l9_142;
float l9_143;
Node2_Voronoi_Noise(l9_34,l9_49,l9_50,l9_142,l9_143,l9_41);
Interpolator0.x=(((l9_138*Port_Input1_N025)+((l9_139*Port_Input1_N016)+(l9_140*Port_Input1_N021)))+(l9_141*Port_Input1_N030))*l9_142;
}
#elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
#if 0
NGS_BACKEND_SHADER_FLAGS_BEGIN__
NGS_BACKEND_SHADER_FLAGS_END__
#endif
#define SC_DISABLE_FRUSTUM_CULLING
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
struct SurfaceProperties
{
vec3 albedo;
float opacity;
vec3 normal;
vec3 positionWS;
vec3 viewDirWS;
float metallic;
float roughness;
vec3 emissive;
vec3 ao;
vec3 specularAo;
vec3 bakedShadows;
vec3 specColor;
};
struct LightingComponents
{
vec3 directDiffuse;
vec3 directSpecular;
vec3 indirectDiffuse;
vec3 indirectSpecular;
vec3 emitted;
vec3 transmitted;
};
struct LightProperties
{
vec3 direction;
vec3 color;
float attenuation;
};
struct sc_SphericalGaussianLight_t
{
vec3 color;
float sharpness;
vec3 axis;
};
#ifndef sc_CanUseStandardDerivatives
#define sc_CanUseStandardDerivatives 0
#elif sc_CanUseStandardDerivatives==1
#undef sc_CanUseStandardDerivatives
#define sc_CanUseStandardDerivatives 1
#endif
#ifndef sc_CanUseTextureLod
#define sc_CanUseTextureLod 0
#elif sc_CanUseTextureLod==1
#undef sc_CanUseTextureLod
#define sc_CanUseTextureLod 1
#endif
#ifndef sc_StereoRenderingMode
#define sc_StereoRenderingMode 0
#endif
#ifndef sc_EnvmapDiffuseHasSwappedViews
#define sc_EnvmapDiffuseHasSwappedViews 0
#elif sc_EnvmapDiffuseHasSwappedViews==1
#undef sc_EnvmapDiffuseHasSwappedViews
#define sc_EnvmapDiffuseHasSwappedViews 1
#endif
#ifndef sc_EnvmapDiffuseLayout
#define sc_EnvmapDiffuseLayout 0
#endif
#ifndef sc_EnvmapSpecularHasSwappedViews
#define sc_EnvmapSpecularHasSwappedViews 0
#elif sc_EnvmapSpecularHasSwappedViews==1
#undef sc_EnvmapSpecularHasSwappedViews
#define sc_EnvmapSpecularHasSwappedViews 1
#endif
#ifndef sc_EnvmapSpecularLayout
#define sc_EnvmapSpecularLayout 0
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
#ifndef sc_ProjectiveShadowsReceiver
#define sc_ProjectiveShadowsReceiver 0
#elif sc_ProjectiveShadowsReceiver==1
#undef sc_ProjectiveShadowsReceiver
#define sc_ProjectiveShadowsReceiver 1
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
#ifndef sc_SSAOEnabled
#define sc_SSAOEnabled 0
#elif sc_SSAOEnabled==1
#undef sc_SSAOEnabled
#define sc_SSAOEnabled 1
#endif
#ifndef sc_MotionVectorsPass
#define sc_MotionVectorsPass 0
#elif sc_MotionVectorsPass==1
#undef sc_MotionVectorsPass
#define sc_MotionVectorsPass 1
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
#ifndef Tweak_N59HasSwappedViews
#define Tweak_N59HasSwappedViews 0
#elif Tweak_N59HasSwappedViews==1
#undef Tweak_N59HasSwappedViews
#define Tweak_N59HasSwappedViews 1
#endif
#ifndef Tweak_N59Layout
#define Tweak_N59Layout 0
#endif
#ifndef opacityTextureAHasSwappedViews
#define opacityTextureAHasSwappedViews 0
#elif opacityTextureAHasSwappedViews==1
#undef opacityTextureAHasSwappedViews
#define opacityTextureAHasSwappedViews 1
#endif
#ifndef opacityTextureALayout
#define opacityTextureALayout 0
#endif
#ifndef opacityTextureBHasSwappedViews
#define opacityTextureBHasSwappedViews 0
#elif opacityTextureBHasSwappedViews==1
#undef opacityTextureBHasSwappedViews
#define opacityTextureBHasSwappedViews 1
#endif
#ifndef opacityTextureBLayout
#define opacityTextureBLayout 0
#endif
#ifndef sc_EnvLightMode
#define sc_EnvLightMode 0
#endif
#ifndef sc_AmbientLightMode_EnvironmentMap
#define sc_AmbientLightMode_EnvironmentMap 0
#endif
#ifndef sc_AmbientLightMode_FromCamera
#define sc_AmbientLightMode_FromCamera 0
#endif
#ifndef sc_LightEstimation
#define sc_LightEstimation 0
#elif sc_LightEstimation==1
#undef sc_LightEstimation
#define sc_LightEstimation 1
#endif
struct sc_LightEstimationData_t
{
sc_SphericalGaussianLight_t sg[12];
vec3 ambientLight;
};
#ifndef sc_LightEstimationSGCount
#define sc_LightEstimationSGCount 0
#endif
#ifndef sc_MaxTextureImageUnits
#define sc_MaxTextureImageUnits 0
#endif
#ifndef sc_HasDiffuseEnvmap
#define sc_HasDiffuseEnvmap 0
#elif sc_HasDiffuseEnvmap==1
#undef sc_HasDiffuseEnvmap
#define sc_HasDiffuseEnvmap 1
#endif
#ifndef sc_AmbientLightMode_SphericalHarmonics
#define sc_AmbientLightMode_SphericalHarmonics 0
#endif
#ifndef sc_AmbientLightsCount
#define sc_AmbientLightsCount 0
#endif
#ifndef sc_AmbientLightMode0
#define sc_AmbientLightMode0 0
#endif
#ifndef sc_AmbientLightMode_Constant
#define sc_AmbientLightMode_Constant 0
#endif
struct sc_AmbientLight_t
{
vec3 color;
float intensity;
};
#ifndef sc_AmbientLightMode1
#define sc_AmbientLightMode1 0
#endif
#ifndef sc_AmbientLightMode2
#define sc_AmbientLightMode2 0
#endif
#ifndef sc_DirectionalLightsCount
#define sc_DirectionalLightsCount 0
#endif
struct sc_DirectionalLight_t
{
vec3 direction;
vec4 color;
};
#ifndef sc_PointLightsCount
#define sc_PointLightsCount 0
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
#ifndef sc_DepthOnly
#define sc_DepthOnly 0
#elif sc_DepthOnly==1
#undef sc_DepthOnly
#define sc_DepthOnly 1
#endif
struct sc_Camera_t
{
vec3 position;
float aspect;
vec2 clipPlanes;
};
#ifndef SC_USE_UV_TRANSFORM_Tweak_N59
#define SC_USE_UV_TRANSFORM_Tweak_N59 0
#elif SC_USE_UV_TRANSFORM_Tweak_N59==1
#undef SC_USE_UV_TRANSFORM_Tweak_N59
#define SC_USE_UV_TRANSFORM_Tweak_N59 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_Tweak_N59
#define SC_SOFTWARE_WRAP_MODE_U_Tweak_N59 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_Tweak_N59
#define SC_SOFTWARE_WRAP_MODE_V_Tweak_N59 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_Tweak_N59
#define SC_USE_UV_MIN_MAX_Tweak_N59 0
#elif SC_USE_UV_MIN_MAX_Tweak_N59==1
#undef SC_USE_UV_MIN_MAX_Tweak_N59
#define SC_USE_UV_MIN_MAX_Tweak_N59 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_Tweak_N59
#define SC_USE_CLAMP_TO_BORDER_Tweak_N59 0
#elif SC_USE_CLAMP_TO_BORDER_Tweak_N59==1
#undef SC_USE_CLAMP_TO_BORDER_Tweak_N59
#define SC_USE_CLAMP_TO_BORDER_Tweak_N59 1
#endif
#ifndef SC_USE_UV_TRANSFORM_opacityTextureA
#define SC_USE_UV_TRANSFORM_opacityTextureA 0
#elif SC_USE_UV_TRANSFORM_opacityTextureA==1
#undef SC_USE_UV_TRANSFORM_opacityTextureA
#define SC_USE_UV_TRANSFORM_opacityTextureA 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_opacityTextureA
#define SC_SOFTWARE_WRAP_MODE_U_opacityTextureA -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_opacityTextureA
#define SC_SOFTWARE_WRAP_MODE_V_opacityTextureA -1
#endif
#ifndef SC_USE_UV_MIN_MAX_opacityTextureA
#define SC_USE_UV_MIN_MAX_opacityTextureA 0
#elif SC_USE_UV_MIN_MAX_opacityTextureA==1
#undef SC_USE_UV_MIN_MAX_opacityTextureA
#define SC_USE_UV_MIN_MAX_opacityTextureA 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_opacityTextureA
#define SC_USE_CLAMP_TO_BORDER_opacityTextureA 0
#elif SC_USE_CLAMP_TO_BORDER_opacityTextureA==1
#undef SC_USE_CLAMP_TO_BORDER_opacityTextureA
#define SC_USE_CLAMP_TO_BORDER_opacityTextureA 1
#endif
#ifndef SC_USE_UV_TRANSFORM_opacityTextureB
#define SC_USE_UV_TRANSFORM_opacityTextureB 0
#elif SC_USE_UV_TRANSFORM_opacityTextureB==1
#undef SC_USE_UV_TRANSFORM_opacityTextureB
#define SC_USE_UV_TRANSFORM_opacityTextureB 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_opacityTextureB
#define SC_SOFTWARE_WRAP_MODE_U_opacityTextureB -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_opacityTextureB
#define SC_SOFTWARE_WRAP_MODE_V_opacityTextureB -1
#endif
#ifndef SC_USE_UV_MIN_MAX_opacityTextureB
#define SC_USE_UV_MIN_MAX_opacityTextureB 0
#elif SC_USE_UV_MIN_MAX_opacityTextureB==1
#undef SC_USE_UV_MIN_MAX_opacityTextureB
#define SC_USE_UV_MIN_MAX_opacityTextureB 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_opacityTextureB
#define SC_USE_CLAMP_TO_BORDER_opacityTextureB 0
#elif SC_USE_CLAMP_TO_BORDER_opacityTextureB==1
#undef SC_USE_CLAMP_TO_BORDER_opacityTextureB
#define SC_USE_CLAMP_TO_BORDER_opacityTextureB 1
#endif
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
uniform vec4 Tweak_N59Dims;
uniform vec4 opacityTextureADims;
uniform vec4 opacityTextureBDims;
uniform sc_LightEstimationData_t sc_LightEstimationData;
uniform vec3 sc_EnvmapRotation;
uniform vec4 sc_EnvmapSpecularSize;
uniform vec4 sc_EnvmapDiffuseSize;
uniform float sc_EnvmapExposure;
uniform vec3 sc_Sh[9];
uniform float sc_ShIntensity;
uniform sc_AmbientLight_t sc_AmbientLights[(sc_AmbientLightsCount+1)];
uniform sc_DirectionalLight_t sc_DirectionalLights[(sc_DirectionalLightsCount+1)];
uniform sc_PointLight_t sc_PointLights[(sc_PointLightsCount+1)];
uniform float Tweak_N171;
uniform float Tweak_N172;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform float overrideTimeDelta;
uniform sc_Camera_t sc_Camera;
uniform float Port_Value2_N060;
uniform float Port_Value3_N060;
uniform float Port_Value4_N060;
uniform mat3 Tweak_N59Transform;
uniform vec4 Tweak_N59UvMinMax;
uniform vec4 Tweak_N59BorderColor;
uniform mat3 opacityTextureATransform;
uniform vec4 opacityTextureAUvMinMax;
uniform vec4 opacityTextureABorderColor;
uniform mat3 opacityTextureBTransform;
uniform vec4 opacityTextureBUvMinMax;
uniform vec4 opacityTextureBBorderColor;
uniform vec3 Port_Normal_N170;
uniform vec3 Port_Emissive_N170;
uniform vec3 Port_AO_N170;
uniform vec3 Port_SpecularAO_N170;
uniform int PreviewEnabled;
uniform vec4 sc_EnvmapDiffuseView;
uniform vec4 sc_EnvmapSpecularView;
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
uniform float Tweak_N14;
uniform float scrollSpeed;
uniform float noiseScale;
uniform float Tweak_N11;
uniform float Tweak_N6;
uniform float Tweak_N37;
uniform vec4 Tweak_N59Size;
uniform vec4 Tweak_N59View;
uniform vec4 opacityTextureASize;
uniform vec4 opacityTextureAView;
uniform vec4 opacityTextureBSize;
uniform vec4 opacityTextureBView;
uniform float Port_Value1_N035;
uniform float Port_Input0_N032;
uniform float Port_Import_N049;
uniform vec3 Port_Import_N051;
uniform vec3 Port_Import_N042;
uniform float Port_Import_N052;
uniform float Port_Import_N041;
uniform float Port_Input1_N023;
uniform float Port_Import_N053;
uniform float Port_Import_N040;
uniform vec2 Port_Input1_N033;
uniform float Port_Input1_N025;
uniform float Port_Input1_N015;
uniform float Port_Input1_N016;
uniform float Port_Input1_N018;
uniform float Port_Input1_N021;
uniform float Port_Input1_N019;
uniform float Port_Input1_N030;
uniform vec3 Port_Import_N044;
uniform float Port_Import_N054;
uniform float Port_Import_N046;
uniform float Port_Import_N055;
uniform float Port_Import_N047;
uniform float Port_Value3_N035;
uniform float Port_Value4_N035;
uniform float Port_Value1_N104;
uniform float Port_Input0_N103;
uniform float Port_Import_N063;
uniform float Port_Value2_N109;
uniform float Port_Value3_N109;
uniform float Port_Value4_N109;
uniform vec3 Port_Import_N064;
uniform vec3 Port_Import_N068;
uniform float Port_Import_N065;
uniform float Port_Import_N070;
uniform float Port_Input1_N073;
uniform float Port_Import_N066;
uniform float Port_Import_N074;
uniform vec2 Port_Input1_N075;
uniform float Port_Input1_N077;
uniform float Port_Input1_N078;
uniform float Port_Input1_N080;
uniform float Port_Input1_N081;
uniform float Port_Input1_N083;
uniform float Port_Input1_N086;
uniform float Port_Input1_N088;
uniform vec3 Port_Import_N094;
uniform float Port_Import_N091;
uniform float Port_Import_N096;
uniform float Port_Import_N092;
uniform float Port_Import_N098;
uniform float Port_Value3_N104;
uniform float Port_Value4_N104;
uniform float Port_Value1_N162;
uniform float Port_Input0_N161;
uniform float Port_Import_N121;
uniform float Port_Value1_N114;
uniform float Port_Value2_N114;
uniform float Port_Value4_N114;
uniform vec3 Port_Import_N122;
uniform vec3 Port_Import_N126;
uniform float Port_Import_N123;
uniform float Port_Import_N128;
uniform float Port_Input1_N131;
uniform float Port_Import_N124;
uniform float Port_Import_N132;
uniform vec2 Port_Input1_N133;
uniform float Port_Input1_N135;
uniform float Port_Input1_N136;
uniform float Port_Input1_N138;
uniform float Port_Input1_N139;
uniform float Port_Input1_N141;
uniform float Port_Input1_N144;
uniform float Port_Input1_N146;
uniform vec3 Port_Import_N152;
uniform float Port_Import_N149;
uniform float Port_Import_N154;
uniform float Port_Import_N150;
uniform float Port_Import_N156;
uniform float Port_Value3_N162;
uniform float Port_Value4_N162;
uniform sampler2D Tweak_N59;
uniform sampler2D opacityTextureA;
uniform sampler2D opacityTextureB;
uniform sampler2D sc_SSAOTexture;
uniform sampler2D sc_ShadowTexture;
uniform sampler2D sc_EnvmapSpecular;
uniform sampler2D sc_EnvmapDiffuse;
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
varying vec3 varPos;
varying vec3 varNormal;
varying vec4 varPackedTex;
varying vec4 Interpolator0;
varying vec4 varTangent;
varying vec4 varScreenPos;
varying vec2 varScreenTexturePos;
varying vec4 varColor;
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
vec3 ssSRGB_to_Linear(vec3 value)
{
vec3 l9_0;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_0=vec3(pow(value.x,2.2),pow(value.y,2.2),pow(value.z,2.2));
}
#else
{
l9_0=value*value;
}
#endif
return l9_0;
}
vec3 evaluateSSAO(vec3 positionWS)
{
#if (sc_SSAOEnabled)
{
vec4 l9_0=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(positionWS,1.0);
return vec3(texture2D(sc_SSAOTexture,((l9_0.xyz/vec3(l9_0.w)).xy*0.5)+vec2(0.5)).x);
}
#else
{
return vec3(1.0);
}
#endif
}
vec3 fresnelSchlickSub(float cosTheta,vec3 F0,vec3 fresnelMax)
{
float l9_0=1.0-cosTheta;
float l9_1=l9_0*l9_0;
return F0+((fresnelMax-F0)*((l9_1*l9_1)*l9_0));
}
float Dggx(float NdotH,float roughness)
{
float l9_0=roughness*roughness;
float l9_1=l9_0*l9_0;
float l9_2=((NdotH*NdotH)*(l9_1-1.0))+1.0;
return l9_1/((l9_2*l9_2)+9.9999999e-09);
}
vec3 calculateDirectSpecular(SurfaceProperties surfaceProperties,vec3 L,vec3 V)
{
float l9_0=surfaceProperties.roughness;
float l9_1=max(l9_0,0.029999999);
vec3 l9_2=surfaceProperties.specColor;
vec3 l9_3=surfaceProperties.normal;
vec3 l9_4=L;
vec3 l9_5=V;
vec3 l9_6=normalize(l9_4+l9_5);
vec3 l9_7=L;
float l9_8=clamp(dot(l9_3,l9_7),0.0,1.0);
vec3 l9_9=V;
float l9_10=clamp(dot(l9_3,l9_6),0.0,1.0);
vec3 l9_11=V;
float l9_12=clamp(dot(l9_11,l9_6),0.0,1.0);
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
float l9_13=l9_1+1.0;
float l9_14=(l9_13*l9_13)*0.125;
float l9_15=1.0-l9_14;
return fresnelSchlickSub(l9_12,l9_2,vec3(1.0))*(((Dggx(l9_10,l9_1)*(1.0/(((l9_8*l9_15)+l9_14)*((clamp(dot(l9_3,l9_9),0.0,1.0)*l9_15)+l9_14))))*0.25)*l9_8);
}
#else
{
float l9_16=exp2(11.0-(10.0*l9_1));
return ((fresnelSchlickSub(l9_12,l9_2,vec3(1.0))*((l9_16*0.125)+0.25))*pow(l9_10,l9_16))*l9_8;
}
#endif
}
LightingComponents accumulateLight(LightingComponents lighting,LightProperties light,SurfaceProperties surfaceProperties,vec3 V)
{
lighting.directDiffuse+=((vec3(clamp(dot(surfaceProperties.normal,light.direction),0.0,1.0))*light.color)*light.attenuation);
lighting.directSpecular+=((calculateDirectSpecular(surfaceProperties,light.direction,V)*light.color)*light.attenuation);
return lighting;
}
float computeDistanceAttenuation(float distanceToLight,float falloffEndDistance)
{
float l9_0=distanceToLight;
float l9_1=distanceToLight;
float l9_2=l9_0*l9_1;
if (falloffEndDistance==0.0)
{
return 1.0/l9_2;
}
return max(min(1.0-((l9_2*l9_2)/pow(falloffEndDistance,4.0)),1.0),0.0)/l9_2;
}
vec2 calcPanoramicTexCoordsFromDir(vec3 reflDir,float rotationDegrees)
{
float l9_0=-reflDir.z;
vec2 l9_1=vec2((((reflDir.x<0.0) ? (-1.0) : 1.0)*acos(clamp(l9_0/length(vec2(reflDir.x,l9_0)),-1.0,1.0)))-1.5707964,acos(reflDir.y))/vec2(6.2831855,3.1415927);
float l9_2=l9_1.x+(rotationDegrees/360.0);
vec2 l9_3=vec2(l9_2,1.0-l9_1.y);
l9_3.x=fract((l9_2+floor(l9_2))+1.0);
return l9_3;
}
int sc_EnvmapSpecularGetStereoViewIndex()
{
int l9_0;
#if (sc_EnvmapSpecularHasSwappedViews)
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
vec4 sc_EnvmapSpecularSampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
return texture2D(sc_EnvmapSpecular,sc_SamplingCoordsViewToGlobal(uv,sc_EnvmapSpecularLayout,viewIndex).xy,bias);
}
vec2 calcSeamlessPanoramicUvsForSampling(vec2 uv,vec2 topMipRes,float lod)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
vec2 l9_0=max(vec2(1.0),topMipRes/vec2(exp2(lod)));
return ((uv*(l9_0-vec2(1.0)))/l9_0)+(vec2(0.5)/l9_0);
}
#else
{
return uv;
}
#endif
}
vec3 getSpecularDominantDir(vec3 N,vec3 R,float roughness)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
return normalize(mix(R,N,vec3((roughness*roughness)*roughness)));
}
#else
{
return R;
}
#endif
}
float sc_InternalCalculateSampleBias(vec2 texSize,vec2 uv,float level_)
{
float l9_0;
#if (sc_CanUseStandardDerivatives)
{
vec2 l9_1=uv*texSize;
float l9_2=l9_1.x;
float l9_3=l9_1.y;
l9_0=level_-log2(max(max(abs(dFdx(l9_2)),abs(dFdy(l9_2))),max(abs(dFdx(l9_3)),abs(dFdy(l9_3)))));
}
#else
{
l9_0=0.0;
}
#endif
return l9_0;
}
vec4 sc_EnvmapSpecularSampleViewIndexLevel(vec2 uv,int viewIndex,float level_)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
float l9_1=level_;
vec3 l9_2=sc_SamplingCoordsViewToGlobal(uv,sc_EnvmapSpecularLayout,viewIndex);
vec2 l9_3=l9_2.xy;
vec4 l9_4;
#if (sc_CanUseTextureLod)
{
l9_4=texture2DLod(sc_EnvmapSpecular,l9_3,l9_1);
}
#else
{
vec4 l9_5;
#if (sc_CanUseStandardDerivatives)
{
l9_5=texture2D(sc_EnvmapSpecular,l9_3,sc_InternalCalculateSampleBias(sc_EnvmapSpecularDims.xy,l9_3,l9_1));
}
#else
{
l9_5=vec4(0.0);
}
#endif
l9_4=l9_5;
}
#endif
l9_0=l9_4;
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
vec3 envBRDFApprox(SurfaceProperties surfaceProperties,float NdotV)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
vec4 l9_0=(vec4(-1.0,-0.0275,-0.57200003,0.022)*surfaceProperties.roughness)+vec4(1.0,0.0425,1.04,-0.039999999);
float l9_1=l9_0.x;
vec2 l9_2=(vec2(-1.04,1.04)*((min(l9_1*l9_1,exp2((-9.2799997)*NdotV))*l9_1)+l9_0.y))+l9_0.zw;
return max((surfaceProperties.specColor*l9_2.x)+vec3(l9_2.y),vec3(0.0));
}
#else
{
return fresnelSchlickSub(NdotV,surfaceProperties.specColor,max(vec3(1.0-surfaceProperties.roughness),surfaceProperties.specColor));
}
#endif
}
int sc_ScreenTextureGetStereoViewIndex()
{
int l9_0;
#if (sc_ScreenTextureHasSwappedViews)
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
vec4 sc_ScreenTextureSampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
return texture2D(sc_ScreenTexture,sc_SamplingCoordsViewToGlobal(uv,sc_ScreenTextureLayout,viewIndex).xy,bias);
}
vec4 sc_readFragData0_Platform()
{
    return getFragData()[0];
}
vec4 sc_readFragData0()
{
vec4 l9_0=sc_readFragData0_Platform();
vec4 l9_1;
#if (sc_UseFramebufferFetchMarker)
{
vec4 l9_2=l9_0;
l9_2.x=l9_0.x+_sc_framebufferFetchMarker;
l9_1=l9_2;
}
#else
{
l9_1=l9_0;
}
#endif
return l9_1;
}
vec4 sc_GetFramebufferColor()
{
vec4 l9_0;
#if (sc_FramebufferFetch)
{
l9_0=sc_readFragData0();
}
#else
{
l9_0=sc_ScreenTextureSampleViewIndexBias(sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw),sc_ScreenTextureGetStereoViewIndex(),0.0);
}
#endif
vec4 l9_1;
#if (((sc_IsEditor&&sc_GetFramebufferColorInvalidUsageMarker)&&(!sc_BlendMode_Software))&&(!sc_BlendMode_ColoredGlass))
{
vec4 l9_2=l9_0;
l9_2.x=l9_0.x+_sc_GetFramebufferColorInvalidUsageMarker;
l9_1=l9_2;
}
#else
{
l9_1=l9_0;
}
#endif
return l9_1;
}
float srgbToLinear(float x)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
return pow(x,2.2);
}
#else
{
return x*x;
}
#endif
}
float linearToSrgb(float x)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
return pow(x,0.45454547);
}
#else
{
return sqrt(x);
}
#endif
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
vec3 l9_0=normalize(sc_Camera.position-varPos);
vec2 l9_1=gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw;
vec2 l9_2=sc_ScreenCoordsGlobalToView(l9_1);
int l9_3;
#if (Tweak_N59HasSwappedViews)
{
l9_3=1-sc_GetStereoViewIndex();
}
#else
{
l9_3=sc_GetStereoViewIndex();
}
#endif
float l9_4=Interpolator0.x;
sc_SoftwareWrapEarly(l9_4,ivec2(SC_SOFTWARE_WRAP_MODE_U_Tweak_N59,SC_SOFTWARE_WRAP_MODE_V_Tweak_N59).x);
float l9_5=l9_4;
float l9_6=Port_Value2_N060;
sc_SoftwareWrapEarly(l9_6,ivec2(SC_SOFTWARE_WRAP_MODE_U_Tweak_N59,SC_SOFTWARE_WRAP_MODE_V_Tweak_N59).y);
float l9_7=l9_6;
vec2 l9_8;
float l9_9;
#if (SC_USE_UV_MIN_MAX_Tweak_N59)
{
bool l9_10;
#if (SC_USE_CLAMP_TO_BORDER_Tweak_N59)
{
l9_10=ivec2(SC_SOFTWARE_WRAP_MODE_U_Tweak_N59,SC_SOFTWARE_WRAP_MODE_V_Tweak_N59).x==3;
}
#else
{
l9_10=(int(SC_USE_CLAMP_TO_BORDER_Tweak_N59)!=0);
}
#endif
float l9_11=l9_5;
float l9_12=1.0;
sc_ClampUV(l9_11,Tweak_N59UvMinMax.x,Tweak_N59UvMinMax.z,l9_10,l9_12);
float l9_13=l9_11;
float l9_14=l9_12;
bool l9_15;
#if (SC_USE_CLAMP_TO_BORDER_Tweak_N59)
{
l9_15=ivec2(SC_SOFTWARE_WRAP_MODE_U_Tweak_N59,SC_SOFTWARE_WRAP_MODE_V_Tweak_N59).y==3;
}
#else
{
l9_15=(int(SC_USE_CLAMP_TO_BORDER_Tweak_N59)!=0);
}
#endif
float l9_16=l9_7;
float l9_17=l9_14;
sc_ClampUV(l9_16,Tweak_N59UvMinMax.y,Tweak_N59UvMinMax.w,l9_15,l9_17);
l9_9=l9_17;
l9_8=vec2(l9_13,l9_16);
}
#else
{
l9_9=1.0;
l9_8=vec2(l9_5,l9_7);
}
#endif
vec2 l9_18=sc_TransformUV(l9_8,(int(SC_USE_UV_TRANSFORM_Tweak_N59)!=0),Tweak_N59Transform);
float l9_19=l9_18.x;
float l9_20=l9_9;
sc_SoftwareWrapLate(l9_19,ivec2(SC_SOFTWARE_WRAP_MODE_U_Tweak_N59,SC_SOFTWARE_WRAP_MODE_V_Tweak_N59).x,(int(SC_USE_CLAMP_TO_BORDER_Tweak_N59)!=0)&&(!(int(SC_USE_UV_MIN_MAX_Tweak_N59)!=0)),l9_20);
float l9_21=l9_18.y;
float l9_22=l9_20;
sc_SoftwareWrapLate(l9_21,ivec2(SC_SOFTWARE_WRAP_MODE_U_Tweak_N59,SC_SOFTWARE_WRAP_MODE_V_Tweak_N59).y,(int(SC_USE_CLAMP_TO_BORDER_Tweak_N59)!=0)&&(!(int(SC_USE_UV_MIN_MAX_Tweak_N59)!=0)),l9_22);
float l9_23=l9_22;
vec3 l9_24=sc_SamplingCoordsViewToGlobal(vec2(l9_19,l9_21),Tweak_N59Layout,l9_3);
vec4 l9_25=texture2D(Tweak_N59,l9_24.xy,0.0);
vec4 l9_26;
#if (SC_USE_CLAMP_TO_BORDER_Tweak_N59)
{
l9_26=mix(Tweak_N59BorderColor,l9_25,vec4(l9_23));
}
#else
{
l9_26=l9_25;
}
#endif
int l9_27;
#if (opacityTextureAHasSwappedViews)
{
l9_27=1-sc_GetStereoViewIndex();
}
#else
{
l9_27=sc_GetStereoViewIndex();
}
#endif
float l9_28=l9_2.x;
sc_SoftwareWrapEarly(l9_28,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureA,SC_SOFTWARE_WRAP_MODE_V_opacityTextureA).x);
float l9_29=l9_28;
float l9_30=l9_2.y;
sc_SoftwareWrapEarly(l9_30,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureA,SC_SOFTWARE_WRAP_MODE_V_opacityTextureA).y);
float l9_31=l9_30;
vec2 l9_32;
float l9_33;
#if (SC_USE_UV_MIN_MAX_opacityTextureA)
{
bool l9_34;
#if (SC_USE_CLAMP_TO_BORDER_opacityTextureA)
{
l9_34=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureA,SC_SOFTWARE_WRAP_MODE_V_opacityTextureA).x==3;
}
#else
{
l9_34=(int(SC_USE_CLAMP_TO_BORDER_opacityTextureA)!=0);
}
#endif
float l9_35=l9_29;
float l9_36=1.0;
sc_ClampUV(l9_35,opacityTextureAUvMinMax.x,opacityTextureAUvMinMax.z,l9_34,l9_36);
float l9_37=l9_35;
float l9_38=l9_36;
bool l9_39;
#if (SC_USE_CLAMP_TO_BORDER_opacityTextureA)
{
l9_39=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureA,SC_SOFTWARE_WRAP_MODE_V_opacityTextureA).y==3;
}
#else
{
l9_39=(int(SC_USE_CLAMP_TO_BORDER_opacityTextureA)!=0);
}
#endif
float l9_40=l9_31;
float l9_41=l9_38;
sc_ClampUV(l9_40,opacityTextureAUvMinMax.y,opacityTextureAUvMinMax.w,l9_39,l9_41);
l9_33=l9_41;
l9_32=vec2(l9_37,l9_40);
}
#else
{
l9_33=1.0;
l9_32=vec2(l9_29,l9_31);
}
#endif
vec2 l9_42=sc_TransformUV(l9_32,(int(SC_USE_UV_TRANSFORM_opacityTextureA)!=0),opacityTextureATransform);
float l9_43=l9_42.x;
float l9_44=l9_33;
sc_SoftwareWrapLate(l9_43,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureA,SC_SOFTWARE_WRAP_MODE_V_opacityTextureA).x,(int(SC_USE_CLAMP_TO_BORDER_opacityTextureA)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTextureA)!=0)),l9_44);
float l9_45=l9_42.y;
float l9_46=l9_44;
sc_SoftwareWrapLate(l9_45,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureA,SC_SOFTWARE_WRAP_MODE_V_opacityTextureA).y,(int(SC_USE_CLAMP_TO_BORDER_opacityTextureA)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTextureA)!=0)),l9_46);
float l9_47=l9_46;
vec3 l9_48=sc_SamplingCoordsViewToGlobal(vec2(l9_43,l9_45),opacityTextureALayout,l9_27);
vec4 l9_49=texture2D(opacityTextureA,l9_48.xy,0.0);
vec4 l9_50;
#if (SC_USE_CLAMP_TO_BORDER_opacityTextureA)
{
l9_50=mix(opacityTextureABorderColor,l9_49,vec4(l9_47));
}
#else
{
l9_50=l9_49;
}
#endif
int l9_51;
#if (opacityTextureBHasSwappedViews)
{
l9_51=1-sc_GetStereoViewIndex();
}
#else
{
l9_51=sc_GetStereoViewIndex();
}
#endif
float l9_52=varPackedTex.x;
sc_SoftwareWrapEarly(l9_52,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureB,SC_SOFTWARE_WRAP_MODE_V_opacityTextureB).x);
float l9_53=l9_52;
float l9_54=varPackedTex.y;
sc_SoftwareWrapEarly(l9_54,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureB,SC_SOFTWARE_WRAP_MODE_V_opacityTextureB).y);
float l9_55=l9_54;
vec2 l9_56;
float l9_57;
#if (SC_USE_UV_MIN_MAX_opacityTextureB)
{
bool l9_58;
#if (SC_USE_CLAMP_TO_BORDER_opacityTextureB)
{
l9_58=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureB,SC_SOFTWARE_WRAP_MODE_V_opacityTextureB).x==3;
}
#else
{
l9_58=(int(SC_USE_CLAMP_TO_BORDER_opacityTextureB)!=0);
}
#endif
float l9_59=l9_53;
float l9_60=1.0;
sc_ClampUV(l9_59,opacityTextureBUvMinMax.x,opacityTextureBUvMinMax.z,l9_58,l9_60);
float l9_61=l9_59;
float l9_62=l9_60;
bool l9_63;
#if (SC_USE_CLAMP_TO_BORDER_opacityTextureB)
{
l9_63=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureB,SC_SOFTWARE_WRAP_MODE_V_opacityTextureB).y==3;
}
#else
{
l9_63=(int(SC_USE_CLAMP_TO_BORDER_opacityTextureB)!=0);
}
#endif
float l9_64=l9_55;
float l9_65=l9_62;
sc_ClampUV(l9_64,opacityTextureBUvMinMax.y,opacityTextureBUvMinMax.w,l9_63,l9_65);
l9_57=l9_65;
l9_56=vec2(l9_61,l9_64);
}
#else
{
l9_57=1.0;
l9_56=vec2(l9_53,l9_55);
}
#endif
vec2 l9_66=sc_TransformUV(l9_56,(int(SC_USE_UV_TRANSFORM_opacityTextureB)!=0),opacityTextureBTransform);
float l9_67=l9_66.x;
float l9_68=l9_57;
sc_SoftwareWrapLate(l9_67,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureB,SC_SOFTWARE_WRAP_MODE_V_opacityTextureB).x,(int(SC_USE_CLAMP_TO_BORDER_opacityTextureB)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTextureB)!=0)),l9_68);
float l9_69=l9_66.y;
float l9_70=l9_68;
sc_SoftwareWrapLate(l9_69,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTextureB,SC_SOFTWARE_WRAP_MODE_V_opacityTextureB).y,(int(SC_USE_CLAMP_TO_BORDER_opacityTextureB)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTextureB)!=0)),l9_70);
float l9_71=l9_70;
vec3 l9_72=sc_SamplingCoordsViewToGlobal(vec2(l9_67,l9_69),opacityTextureBLayout,l9_51);
vec4 l9_73=texture2D(opacityTextureB,l9_72.xy,0.0);
vec4 l9_74;
#if (SC_USE_CLAMP_TO_BORDER_opacityTextureB)
{
l9_74=mix(opacityTextureBBorderColor,l9_73,vec4(l9_71));
}
#else
{
l9_74=l9_73;
}
#endif
vec4 l9_75=l9_50*l9_74;
vec3 l9_76;
#if (!sc_ProjectiveShadowsCaster)
{
l9_76=normalize(varNormal);
}
#else
{
l9_76=vec3(0.0);
}
#endif
float l9_77=clamp(l9_75.x,0.0,1.0);
#if (sc_BlendMode_AlphaTest)
{
if (l9_77<alphaTestThreshold)
{
discard;
}
}
#endif
#if (ENABLE_STIPPLE_PATTERN_TEST)
{
if (l9_77<((mod(dot(floor(mod(gl_FragCoord.xy,vec2(4.0))),vec2(4.0,1.0))*9.0,16.0)+1.0)/17.0))
{
discard;
}
}
#endif
vec3 l9_78=max(l9_26.xyz,vec3(0.0));
vec4 l9_79;
#if (sc_ProjectiveShadowsCaster)
{
l9_79=vec4(l9_78,l9_77);
}
#else
{
float l9_80=clamp(Tweak_N171,0.0,1.0);
float l9_81=clamp(Tweak_N172,0.0,1.0);
vec3 l9_82=ssSRGB_to_Linear(l9_78);
vec3 l9_83=normalize(l9_76);
vec3 l9_84=ssSRGB_to_Linear(Port_Emissive_N170);
vec3 l9_85;
#if (sc_SSAOEnabled)
{
l9_85=evaluateSSAO(varPos);
}
#else
{
l9_85=Port_AO_N170;
}
#endif
vec3 l9_86=vec3(l9_80);
vec3 l9_87=mix(vec3(0.039999999),l9_82*l9_80,l9_86);
vec3 l9_88=mix(l9_82*(1.0-l9_80),vec3(0.0),l9_86);
SurfaceProperties l9_89=SurfaceProperties(l9_88,l9_77,l9_83,varPos,l9_0,l9_80,l9_81,l9_84,l9_85,Port_SpecularAO_N170,vec3(1.0),l9_87);
vec4 l9_90=vec4(1.0);
vec3 l9_91;
vec3 l9_92;
vec3 l9_93;
vec3 l9_94;
int l9_95;
vec3 l9_96;
vec3 l9_97;
#if (sc_DirectionalLightsCount>0)
{
vec3 l9_98;
vec3 l9_99;
vec3 l9_100;
vec3 l9_101;
int l9_102;
vec3 l9_103;
vec3 l9_104;
l9_104=vec3(1.0);
l9_103=vec3(0.0);
l9_102=0;
l9_101=vec3(0.0);
l9_100=vec3(0.0);
l9_99=vec3(0.0);
l9_98=vec3(0.0);
LightingComponents l9_105;
LightProperties l9_106;
SurfaceProperties l9_107;
vec3 l9_108;
int l9_109=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_109<sc_DirectionalLightsCount)
{
LightingComponents l9_110=accumulateLight(LightingComponents(l9_98,l9_99,l9_104,l9_103,l9_101,l9_100),LightProperties(sc_DirectionalLights[l9_109].direction,sc_DirectionalLights[l9_109].color.xyz,sc_DirectionalLights[l9_109].color.w*l9_90[(l9_102<3) ? l9_102 : 3]),l9_89,l9_0);
l9_104=l9_110.indirectDiffuse;
l9_103=l9_110.indirectSpecular;
l9_102++;
l9_101=l9_110.emitted;
l9_100=l9_110.transmitted;
l9_99=l9_110.directSpecular;
l9_98=l9_110.directDiffuse;
l9_109++;
continue;
}
else
{
break;
}
}
l9_97=l9_104;
l9_96=l9_103;
l9_95=l9_102;
l9_94=l9_101;
l9_93=l9_100;
l9_92=l9_99;
l9_91=l9_98;
}
#else
{
l9_97=vec3(1.0);
l9_96=vec3(0.0);
l9_95=0;
l9_94=vec3(0.0);
l9_93=vec3(0.0);
l9_92=vec3(0.0);
l9_91=vec3(0.0);
}
#endif
vec3 l9_111;
vec3 l9_112;
vec3 l9_113;
#if (sc_PointLightsCount>0)
{
vec3 l9_114;
vec3 l9_115;
vec3 l9_116;
vec3 l9_117;
vec3 l9_118;
vec3 l9_119;
l9_119=l9_97;
l9_118=l9_96;
l9_117=l9_94;
l9_116=l9_93;
l9_115=l9_92;
l9_114=l9_91;
int l9_120;
vec3 l9_121;
vec3 l9_122;
vec3 l9_123;
vec3 l9_124;
vec3 l9_125;
vec3 l9_126;
int l9_127=0;
int l9_128=l9_95;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_127<sc_PointLightsCount)
{
vec3 l9_129=sc_PointLights[l9_127].position-varPos;
vec3 l9_130=normalize(l9_129);
float l9_131=l9_90[(l9_128<3) ? l9_128 : 3];
float l9_132=clamp((dot(l9_130,sc_PointLights[l9_127].direction)*sc_PointLights[l9_127].angleScale)+sc_PointLights[l9_127].angleOffset,0.0,1.0);
float l9_133=(sc_PointLights[l9_127].color.w*l9_131)*(l9_132*l9_132);
float l9_134;
if (sc_PointLights[l9_127].falloffEnabled)
{
l9_134=l9_133*computeDistanceAttenuation(length(l9_129),sc_PointLights[l9_127].falloffEndDistance);
}
else
{
l9_134=l9_133;
}
l9_120=l9_128+1;
LightingComponents l9_135=accumulateLight(LightingComponents(l9_114,l9_115,l9_119,l9_118,l9_117,l9_116),LightProperties(l9_130,sc_PointLights[l9_127].color.xyz,l9_134),l9_89,l9_0);
l9_121=l9_135.directDiffuse;
l9_122=l9_135.directSpecular;
l9_123=l9_135.indirectDiffuse;
l9_124=l9_135.indirectSpecular;
l9_125=l9_135.emitted;
l9_126=l9_135.transmitted;
l9_119=l9_123;
l9_118=l9_124;
l9_128=l9_120;
l9_117=l9_125;
l9_116=l9_126;
l9_115=l9_122;
l9_114=l9_121;
l9_127++;
continue;
}
else
{
break;
}
}
l9_113=l9_116;
l9_112=l9_115;
l9_111=l9_114;
}
#else
{
l9_113=l9_93;
l9_112=l9_92;
l9_111=l9_91;
}
#endif
vec3 l9_136;
vec3 l9_137;
#if (sc_ProjectiveShadowsReceiver)
{
vec3 l9_138;
#if (sc_ProjectiveShadowsReceiver)
{
vec2 l9_139=abs(varShadowTex-vec2(0.5));
vec4 l9_140=texture2D(sc_ShadowTexture,varShadowTex)*step(max(l9_139.x,l9_139.y),0.5);
l9_138=mix(vec3(1.0),mix(sc_ShadowColor.xyz,sc_ShadowColor.xyz*l9_140.xyz,vec3(sc_ShadowColor.w)),vec3(l9_140.w*sc_ShadowDensity));
}
#else
{
l9_138=vec3(1.0);
}
#endif
l9_137=l9_111*l9_138;
l9_136=l9_112*l9_138;
}
#else
{
l9_137=l9_111;
l9_136=l9_112;
}
#endif
vec3 l9_141;
#if ((sc_EnvLightMode==sc_AmbientLightMode_EnvironmentMap)||(sc_EnvLightMode==sc_AmbientLightMode_FromCamera))
{
vec2 l9_142=calcPanoramicTexCoordsFromDir(l9_83,sc_EnvmapRotation.y);
vec4 l9_143;
#if (sc_EnvLightMode==sc_AmbientLightMode_FromCamera)
{
vec2 l9_144;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_144=calcSeamlessPanoramicUvsForSampling(l9_142,sc_EnvmapSpecularSize.xy,5.0);
}
#else
{
l9_144=l9_142;
}
#endif
l9_143=sc_EnvmapSpecularSampleViewIndexBias(l9_144,sc_EnvmapSpecularGetStereoViewIndex(),13.0);
}
#else
{
vec4 l9_145;
#if ((sc_MaxTextureImageUnits>8)&&sc_HasDiffuseEnvmap)
{
vec2 l9_146=calcSeamlessPanoramicUvsForSampling(l9_142,sc_EnvmapDiffuseSize.xy,0.0);
int l9_147;
#if (sc_EnvmapDiffuseHasSwappedViews)
{
l9_147=1-sc_GetStereoViewIndex();
}
#else
{
l9_147=sc_GetStereoViewIndex();
}
#endif
l9_145=texture2D(sc_EnvmapDiffuse,sc_SamplingCoordsViewToGlobal(l9_146,sc_EnvmapDiffuseLayout,l9_147).xy,-13.0);
}
#else
{
l9_145=sc_EnvmapSpecularSampleViewIndexBias(l9_142,sc_EnvmapSpecularGetStereoViewIndex(),13.0);
}
#endif
l9_143=l9_145;
}
#endif
l9_141=(l9_143.xyz*(1.0/l9_143.w))*sc_EnvmapExposure;
}
#else
{
vec3 l9_148;
#if (sc_EnvLightMode==sc_AmbientLightMode_SphericalHarmonics)
{
vec3 l9_149=-l9_83;
float l9_150=l9_149.x;
float l9_151=l9_149.y;
float l9_152=l9_149.z;
l9_148=(((((((sc_Sh[8]*0.42904299)*((l9_150*l9_150)-(l9_151*l9_151)))+((sc_Sh[6]*0.74312502)*(l9_152*l9_152)))+(sc_Sh[0]*0.88622701))-(sc_Sh[6]*0.24770799))+((((sc_Sh[4]*(l9_150*l9_151))+(sc_Sh[7]*(l9_150*l9_152)))+(sc_Sh[5]*(l9_151*l9_152)))*0.85808599))+((((sc_Sh[3]*l9_150)+(sc_Sh[1]*l9_151))+(sc_Sh[2]*l9_152))*1.0233279))*sc_ShIntensity;
}
#else
{
l9_148=vec3(0.0);
}
#endif
l9_141=l9_148;
}
#endif
vec3 l9_153;
#if (sc_AmbientLightsCount>0)
{
vec3 l9_154;
#if (sc_AmbientLightMode0==sc_AmbientLightMode_Constant)
{
l9_154=l9_141+(sc_AmbientLights[0].color*sc_AmbientLights[0].intensity);
}
#else
{
vec3 l9_155=l9_141;
l9_155.x=l9_141.x+(1e-06*sc_AmbientLights[0].color.x);
l9_154=l9_155;
}
#endif
l9_153=l9_154;
}
#else
{
l9_153=l9_141;
}
#endif
vec3 l9_156;
#if (sc_AmbientLightsCount>1)
{
vec3 l9_157;
#if (sc_AmbientLightMode1==sc_AmbientLightMode_Constant)
{
l9_157=l9_153+(sc_AmbientLights[1].color*sc_AmbientLights[1].intensity);
}
#else
{
vec3 l9_158=l9_153;
l9_158.x=l9_153.x+(1e-06*sc_AmbientLights[1].color.x);
l9_157=l9_158;
}
#endif
l9_156=l9_157;
}
#else
{
l9_156=l9_153;
}
#endif
vec3 l9_159;
#if (sc_AmbientLightsCount>2)
{
vec3 l9_160;
#if (sc_AmbientLightMode2==sc_AmbientLightMode_Constant)
{
l9_160=l9_156+(sc_AmbientLights[2].color*sc_AmbientLights[2].intensity);
}
#else
{
vec3 l9_161=l9_156;
l9_161.x=l9_156.x+(1e-06*sc_AmbientLights[2].color.x);
l9_160=l9_161;
}
#endif
l9_159=l9_160;
}
#else
{
l9_159=l9_156;
}
#endif
vec3 l9_162;
#if (sc_LightEstimation)
{
vec3 l9_163;
l9_163=sc_LightEstimationData.ambientLight;
vec3 l9_164;
int l9_165=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_165<sc_LightEstimationSGCount)
{
float l9_166=dot(sc_LightEstimationData.sg[l9_165].axis,l9_83);
float l9_167=exp(-sc_LightEstimationData.sg[l9_165].sharpness);
float l9_168=l9_167*l9_167;
float l9_169=1.0/sc_LightEstimationData.sg[l9_165].sharpness;
float l9_170=(1.0+(2.0*l9_168))-l9_169;
float l9_171=sqrt(1.0-l9_170);
float l9_172=0.36000001*l9_166;
float l9_173=(1.0/(4.0*0.36000001))*l9_171;
float l9_174=l9_172+l9_173;
float l9_175;
if (step(abs(l9_172),l9_173)>0.5)
{
l9_175=(l9_174*l9_174)/l9_171;
}
else
{
l9_175=clamp(l9_166,0.0,1.0);
}
l9_164=l9_163+((((sc_LightEstimationData.sg[l9_165].color/vec3(sc_LightEstimationData.sg[l9_165].sharpness))*6.2831855)*((l9_170*l9_175)+(((l9_167-l9_168)*l9_169)-l9_168)))/vec3(3.1415927));
l9_163=l9_164;
l9_165++;
continue;
}
else
{
break;
}
}
l9_162=l9_159+l9_163;
}
#else
{
l9_162=l9_159;
}
#endif
vec3 l9_176;
#if ((sc_EnvLightMode==sc_AmbientLightMode_EnvironmentMap)||(sc_EnvLightMode==sc_AmbientLightMode_FromCamera))
{
float l9_177=clamp(pow(l9_81,0.66666669),0.0,1.0)*5.0;
vec2 l9_178=calcPanoramicTexCoordsFromDir(getSpecularDominantDir(l9_83,reflect(-l9_0,l9_83),l9_81),sc_EnvmapRotation.y);
vec4 l9_179;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
float l9_180=floor(l9_177);
float l9_181=ceil(l9_177);
l9_179=mix(sc_EnvmapSpecularSampleViewIndexLevel(calcSeamlessPanoramicUvsForSampling(l9_178,sc_EnvmapSpecularSize.xy,l9_180),sc_EnvmapSpecularGetStereoViewIndex(),l9_180),sc_EnvmapSpecularSampleViewIndexLevel(calcSeamlessPanoramicUvsForSampling(l9_178,sc_EnvmapSpecularSize.xy,l9_181),sc_EnvmapSpecularGetStereoViewIndex(),l9_181),vec4(l9_177-l9_180));
}
#else
{
l9_179=sc_EnvmapSpecularSampleViewIndexLevel(l9_178,sc_EnvmapSpecularGetStereoViewIndex(),l9_177);
}
#endif
l9_176=vec3(0.0)+((((l9_179.xyz*(1.0/l9_179.w))*sc_EnvmapExposure)+vec3(1e-06))*envBRDFApprox(l9_89,abs(dot(l9_83,l9_0))));
}
#else
{
l9_176=vec3(0.0);
}
#endif
vec3 l9_182;
#if (sc_LightEstimation)
{
float l9_183=clamp(l9_81*l9_81,0.0099999998,1.0);
vec3 l9_184;
l9_184=sc_LightEstimationData.ambientLight*l9_87;
int l9_185=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_185<sc_LightEstimationSGCount)
{
float l9_186=l9_183*l9_183;
vec3 l9_187=reflect(-l9_0,l9_83);
float l9_188=dot(l9_83,l9_0);
float l9_189=(2.0/l9_186)/(4.0*max(l9_188,9.9999997e-05));
float l9_190=length((l9_187*l9_189)+(sc_LightEstimationData.sg[l9_185].axis*sc_LightEstimationData.sg[l9_185].sharpness));
float l9_191=clamp(dot(l9_83,l9_187),0.0,1.0);
float l9_192=clamp(l9_188,0.0,1.0);
float l9_193=1.0-l9_186;
l9_184+=((((((((vec3(1.0/(3.1415927*l9_186))*exp((l9_190-l9_189)-sc_LightEstimationData.sg[l9_185].sharpness))*sc_LightEstimationData.sg[l9_185].color)*6.2831855)*(1.0-exp((-2.0)*l9_190)))/vec3(l9_190))*((1.0/(l9_191+sqrt(l9_186+((l9_193*l9_191)*l9_191))))*(1.0/(l9_192+sqrt(l9_186+((l9_193*l9_192)*l9_192))))))*(l9_87+((vec3(1.0)-l9_87)*pow(1.0-clamp(dot(l9_187,normalize(l9_187+l9_0)),0.0,1.0),5.0))))*l9_191);
l9_185++;
continue;
}
else
{
break;
}
}
l9_182=l9_176+l9_184;
}
#else
{
l9_182=l9_176;
}
#endif
float l9_194;
vec3 l9_195;
vec3 l9_196;
vec3 l9_197;
#if (sc_BlendMode_ColoredGlass)
{
l9_197=vec3(0.0);
l9_196=vec3(0.0);
l9_195=ssSRGB_to_Linear(sc_GetFramebufferColor().xyz)*mix(vec3(1.0),l9_88,vec3(l9_77));
l9_194=1.0;
}
#else
{
l9_197=l9_137;
l9_196=l9_162;
l9_195=l9_113;
l9_194=l9_77;
}
#endif
bool l9_198;
#if (sc_BlendMode_PremultipliedAlpha)
{
l9_198=true;
}
#else
{
l9_198=false;
}
#endif
vec3 l9_199=l9_196*l9_85;
vec3 l9_200=l9_197+l9_199;
vec3 l9_201=l9_88*l9_200;
vec3 l9_202=l9_182*Port_SpecularAO_N170;
vec3 l9_203=l9_136+l9_202;
vec3 l9_204;
if (l9_198)
{
l9_204=l9_201*srgbToLinear(l9_194);
}
else
{
l9_204=l9_201;
}
vec3 l9_205=l9_204+l9_203;
vec3 l9_206=(l9_205+l9_84)+l9_195;
float l9_207=l9_206.x;
vec4 l9_208=vec4(l9_207,l9_206.yz,l9_194);
vec4 l9_209;
#if (sc_IsEditor)
{
vec4 l9_210=l9_208;
l9_210.x=l9_207+((l9_85.x*Port_SpecularAO_N170.x)*9.9999997e-06);
l9_209=l9_210;
}
#else
{
l9_209=l9_208;
}
#endif
vec4 l9_211;
#if (!sc_BlendMode_Multiply)
{
vec3 l9_212=l9_209.xyz*1.8;
vec3 l9_213=(l9_209.xyz*(l9_212+vec3(1.4)))/((l9_209.xyz*(l9_212+vec3(0.5)))+vec3(1.5));
l9_211=vec4(l9_213.x,l9_213.y,l9_213.z,l9_209.w);
}
#else
{
l9_211=l9_209;
}
#endif
vec3 l9_214=vec3(linearToSrgb(l9_211.x),linearToSrgb(l9_211.y),linearToSrgb(l9_211.z));
l9_79=vec4(l9_214.x,l9_214.y,l9_214.z,l9_211.w);
}
#endif
vec4 l9_215=max(l9_79,vec4(0.0));
vec4 l9_216;
#if (sc_ProjectiveShadowsCaster)
{
float l9_217;
#if (((sc_BlendMode_Normal||sc_BlendMode_AlphaToCoverage)||sc_BlendMode_PremultipliedAlphaHardware)||sc_BlendMode_PremultipliedAlphaAuto)
{
l9_217=l9_215.w;
}
#else
{
float l9_218;
#if (sc_BlendMode_PremultipliedAlpha)
{
l9_218=clamp(l9_215.w*2.0,0.0,1.0);
}
#else
{
float l9_219;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_219=clamp(dot(l9_215.xyz,vec3(l9_215.w)),0.0,1.0);
}
#else
{
float l9_220;
#if (sc_BlendMode_AlphaTest)
{
l9_220=1.0;
}
#else
{
float l9_221;
#if (sc_BlendMode_Multiply)
{
l9_221=(1.0-dot(l9_215.xyz,vec3(0.33333001)))*l9_215.w;
}
#else
{
float l9_222;
#if (sc_BlendMode_MultiplyOriginal)
{
l9_222=(1.0-clamp(dot(l9_215.xyz,vec3(1.0)),0.0,1.0))*l9_215.w;
}
#else
{
float l9_223;
#if (sc_BlendMode_ColoredGlass)
{
l9_223=clamp(dot(l9_215.xyz,vec3(1.0)),0.0,1.0)*l9_215.w;
}
#else
{
float l9_224;
#if (sc_BlendMode_Add)
{
l9_224=clamp(dot(l9_215.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_225;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_225=clamp(dot(l9_215.xyz,vec3(1.0)),0.0,1.0)*l9_215.w;
}
#else
{
float l9_226;
#if (sc_BlendMode_Screen)
{
l9_226=dot(l9_215.xyz,vec3(0.33333001))*l9_215.w;
}
#else
{
float l9_227;
#if (sc_BlendMode_Min)
{
l9_227=1.0-clamp(dot(l9_215.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_228;
#if (sc_BlendMode_Max)
{
l9_228=clamp(dot(l9_215.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
l9_228=1.0;
}
#endif
l9_227=l9_228;
}
#endif
l9_226=l9_227;
}
#endif
l9_225=l9_226;
}
#endif
l9_224=l9_225;
}
#endif
l9_223=l9_224;
}
#endif
l9_222=l9_223;
}
#endif
l9_221=l9_222;
}
#endif
l9_220=l9_221;
}
#endif
l9_219=l9_220;
}
#endif
l9_218=l9_219;
}
#endif
l9_217=l9_218;
}
#endif
l9_216=vec4(mix(sc_ShadowColor.xyz,sc_ShadowColor.xyz*l9_215.xyz,vec3(sc_ShadowColor.w)),sc_ShadowDensity*l9_217);
}
#else
{
vec4 l9_229;
#if (sc_RenderAlphaToColor)
{
l9_229=vec4(l9_215.w);
}
#else
{
vec4 l9_230;
#if (sc_BlendMode_Custom)
{
vec3 l9_231=sc_GetFramebufferColor().xyz;
vec3 l9_232=mix(l9_231,definedBlend(l9_231,l9_215.xyz).xyz,vec3(l9_215.w));
vec4 l9_233=vec4(l9_232.x,l9_232.y,l9_232.z,vec4(0.0).w);
l9_233.w=1.0;
l9_230=l9_233;
}
#else
{
vec4 l9_234;
#if (sc_BlendMode_MultiplyOriginal)
{
float l9_235=l9_215.w;
l9_234=vec4(mix(vec3(1.0),l9_215.xyz,vec3(l9_235)),l9_235);
}
#else
{
vec4 l9_236;
#if (sc_BlendMode_Screen||sc_BlendMode_PremultipliedAlphaAuto)
{
float l9_237=l9_215.w;
float l9_238;
#if (sc_BlendMode_PremultipliedAlphaAuto)
{
l9_238=clamp(l9_237,0.0,1.0);
}
#else
{
l9_238=l9_237;
}
#endif
l9_236=vec4(l9_215.xyz*l9_238,l9_238);
}
#else
{
l9_236=l9_215;
}
#endif
l9_234=l9_236;
}
#endif
l9_230=l9_234;
}
#endif
l9_229=l9_230;
}
#endif
l9_216=l9_229;
}
#endif
vec4 l9_239;
if (PreviewEnabled==1)
{
vec4 l9_240;
if (((PreviewVertexSaved*1.0)!=0.0) ? true : false)
{
l9_240=PreviewVertexColor;
}
else
{
l9_240=vec4(0.0);
}
l9_239=l9_240;
}
else
{
l9_239=l9_216;
}
vec4 l9_241;
#if (sc_ShaderComplexityAnalyzer)
{
l9_241=vec4(shaderComplexityValue/255.0,0.0,0.0,1.0);
}
#else
{
l9_241=vec4(0.0);
}
#endif
vec4 l9_242;
if (l9_241.w>0.0)
{
l9_242=l9_241;
}
else
{
l9_242=l9_239;
}
vec4 l9_243=outputMotionVectorsIfNeeded(varPos,max(l9_242,vec4(0.0)));
vec4 l9_244=clamp(l9_243,vec4(0.0),vec4(1.0));
#if (sc_OITDepthBoundsPass)
{
#if (sc_OITDepthBoundsPass)
{
float l9_245=clamp(viewSpaceDepth()/1000.0,0.0,1.0);
sc_writeFragData0(vec4(max(0.0,1.0-(l9_245-0.0039215689)),min(1.0,l9_245+0.0039215689),0.0,0.0));
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
vec2 l9_246=sc_ScreenCoordsGlobalToView(l9_1);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,l9_246).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_247=encodeDepth(viewSpaceDepth(),texture2D(sc_OITFilteredDepthBoundsTexture,l9_246).xy);
float l9_248=packValue(l9_247);
int l9_255=int(l9_244.w*255.0);
float l9_256=packValue(l9_255);
sc_writeFragData0(vec4(packValue(l9_247),packValue(l9_247),packValue(l9_247),packValue(l9_247)));
sc_writeFragData1(vec4(l9_248,packValue(l9_247),packValue(l9_247),packValue(l9_247)));
sc_writeFragData2(vec4(l9_256,packValue(l9_255),packValue(l9_255),packValue(l9_255)));
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
vec2 l9_259=sc_ScreenCoordsGlobalToView(l9_1);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,l9_259).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_260[8];
int l9_261[8];
int l9_262=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_262<8)
{
l9_260[l9_262]=0;
l9_261[l9_262]=0;
l9_262++;
continue;
}
else
{
break;
}
}
int l9_263;
#if (sc_OITMaxLayers8)
{
l9_263=2;
}
#else
{
l9_263=1;
}
#endif
int l9_264=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_264<l9_263)
{
vec4 l9_265;
vec4 l9_266;
vec4 l9_267;
if (l9_264==0)
{
l9_267=texture2D(sc_OITAlpha0,l9_259);
l9_266=texture2D(sc_OITDepthLow0,l9_259);
l9_265=texture2D(sc_OITDepthHigh0,l9_259);
}
else
{
l9_267=vec4(0.0);
l9_266=vec4(0.0);
l9_265=vec4(0.0);
}
vec4 l9_268;
vec4 l9_269;
vec4 l9_270;
if (l9_264==1)
{
l9_270=texture2D(sc_OITAlpha1,l9_259);
l9_269=texture2D(sc_OITDepthLow1,l9_259);
l9_268=texture2D(sc_OITDepthHigh1,l9_259);
}
else
{
l9_270=l9_267;
l9_269=l9_266;
l9_268=l9_265;
}
if (any(notEqual(l9_268,vec4(0.0)))||any(notEqual(l9_269,vec4(0.0))))
{
int l9_271[8]=l9_260;
unpackValues(l9_268.w,l9_264,l9_271);
unpackValues(l9_268.z,l9_264,l9_271);
unpackValues(l9_268.y,l9_264,l9_271);
unpackValues(l9_268.x,l9_264,l9_271);
unpackValues(l9_269.w,l9_264,l9_271);
unpackValues(l9_269.z,l9_264,l9_271);
unpackValues(l9_269.y,l9_264,l9_271);
unpackValues(l9_269.x,l9_264,l9_271);
int l9_280[8]=l9_261;
unpackValues(l9_270.w,l9_264,l9_280);
unpackValues(l9_270.z,l9_264,l9_280);
unpackValues(l9_270.y,l9_264,l9_280);
unpackValues(l9_270.x,l9_264,l9_280);
}
l9_264++;
continue;
}
else
{
break;
}
}
vec4 l9_285=texture2D(sc_OITFilteredDepthBoundsTexture,l9_259);
vec2 l9_286=l9_285.xy;
int l9_287;
#if (sc_SkinBonesCount>0)
{
l9_287=encodeDepth(((1.0-l9_285.x)*1000.0)+getDepthOrderingEpsilon(),l9_286);
}
#else
{
l9_287=0;
}
#endif
int l9_288=encodeDepth(viewSpaceDepth(),l9_286);
vec4 l9_289;
l9_289=l9_244*l9_244.w;
vec4 l9_290;
int l9_291=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_291<8)
{
int l9_292=l9_260[l9_291];
int l9_293=l9_288-l9_287;
bool l9_294=l9_292<l9_293;
bool l9_295;
if (l9_294)
{
l9_295=l9_260[l9_291]>0;
}
else
{
l9_295=l9_294;
}
if (l9_295)
{
vec3 l9_296=l9_289.xyz*(1.0-(float(l9_261[l9_291])/255.0));
l9_290=vec4(l9_296.x,l9_296.y,l9_296.z,l9_289.w);
}
else
{
l9_290=l9_289;
}
l9_289=l9_290;
l9_291++;
continue;
}
else
{
break;
}
}
sc_writeFragData0(l9_289);
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
if (abs(gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,sc_ScreenCoordsGlobalToView(l9_1)).x)>getFrontLayerZTestEpsilon())
{
discard;
}
sc_writeFragData0(l9_244);
}
#endif
}
#else
{
sc_writeFragData0(l9_243);
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
