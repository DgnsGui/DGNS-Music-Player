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
//sampler sampler baseColorTextureSmpSC 0:26
//sampler sampler clearcoatNormalTextureSmpSC 0:27
//sampler sampler clearcoatRoughnessTextureSmpSC 0:28
//sampler sampler clearcoatTextureSmpSC 0:29
//sampler sampler emissiveTextureSmpSC 0:30
//sampler sampler intensityTextureSmpSC 0:31
//sampler sampler metallicRoughnessTextureSmpSC 0:32
//sampler sampler normalTextureSmpSC 0:33
//sampler sampler sc_EnvmapDiffuseSmpSC 0:34
//sampler sampler sc_EnvmapSpecularSmpSC 0:35
//sampler sampler sc_OITCommonSampler 0:36
//sampler sampler sc_SSAOTextureSmpSC 0:37
//sampler sampler sc_ScreenTextureSmpSC 0:38
//sampler sampler sc_ShadowTextureSmpSC 0:39
//sampler sampler screenTextureSmpSC 0:41
//sampler sampler sheenColorTextureSmpSC 0:42
//sampler sampler sheenRoughnessTextureSmpSC 0:43
//sampler sampler transmissionTextureSmpSC 0:44
//texture texture2D baseColorTexture 0:0:0:26
//texture texture2D clearcoatNormalTexture 0:1:0:27
//texture texture2D clearcoatRoughnessTexture 0:2:0:28
//texture texture2D clearcoatTexture 0:3:0:29
//texture texture2D emissiveTexture 0:4:0:30
//texture texture2D intensityTexture 0:5:0:31
//texture texture2D metallicRoughnessTexture 0:6:0:32
//texture texture2D normalTexture 0:7:0:33
//texture texture2D sc_EnvmapDiffuse 0:8:0:34
//texture texture2D sc_EnvmapSpecular 0:9:0:35
//texture texture2D sc_OITAlpha0 0:10:0:36
//texture texture2D sc_OITAlpha1 0:11:0:36
//texture texture2D sc_OITDepthHigh0 0:12:0:36
//texture texture2D sc_OITDepthHigh1 0:13:0:36
//texture texture2D sc_OITDepthLow0 0:14:0:36
//texture texture2D sc_OITDepthLow1 0:15:0:36
//texture texture2D sc_OITFilteredDepthBoundsTexture 0:16:0:36
//texture texture2D sc_OITFrontDepthTexture 0:17:0:36
//texture texture2D sc_SSAOTexture 0:18:0:37
//texture texture2D sc_ScreenTexture 0:19:0:38
//texture texture2D sc_ShadowTexture 0:20:0:39
//texture texture2D screenTexture 0:22:0:41
//texture texture2D sheenColorTexture 0:23:0:42
//texture texture2D sheenRoughnessTexture 0:24:0:43
//texture texture2D transmissionTexture 0:25:0:44
//SG_REFLECTION_END
#if defined VERTEX_SHADER
#if 0
NGS_BACKEND_SHADER_FLAGS_BEGIN__
NGS_BACKEND_SHADER_FLAGS_END__
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
uniform vec4 emissiveTextureDims;
uniform vec4 normalTextureDims;
uniform vec4 metallicRoughnessTextureDims;
uniform vec4 transmissionTextureDims;
uniform vec4 screenTextureDims;
uniform vec4 sheenColorTextureDims;
uniform vec4 sheenRoughnessTextureDims;
uniform vec4 clearcoatTextureDims;
uniform vec4 clearcoatRoughnessTextureDims;
uniform vec4 clearcoatNormalTextureDims;
uniform vec4 baseColorTextureDims;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
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
uniform vec3 emissiveFactor;
uniform vec4 emissiveTextureSize;
uniform vec4 emissiveTextureView;
uniform mat3 emissiveTextureTransform;
uniform vec4 emissiveTextureUvMinMax;
uniform vec4 emissiveTextureBorderColor;
uniform float normalTextureScale;
uniform vec4 normalTextureSize;
uniform vec4 normalTextureView;
uniform mat3 normalTextureTransform;
uniform vec4 normalTextureUvMinMax;
uniform vec4 normalTextureBorderColor;
uniform float metallicFactor;
uniform float roughnessFactor;
uniform float occlusionTextureStrength;
uniform vec4 metallicRoughnessTextureSize;
uniform vec4 metallicRoughnessTextureView;
uniform mat3 metallicRoughnessTextureTransform;
uniform vec4 metallicRoughnessTextureUvMinMax;
uniform vec4 metallicRoughnessTextureBorderColor;
uniform float transmissionFactor;
uniform vec4 transmissionTextureSize;
uniform vec4 transmissionTextureView;
uniform mat3 transmissionTextureTransform;
uniform vec4 transmissionTextureUvMinMax;
uniform vec4 transmissionTextureBorderColor;
uniform vec4 screenTextureSize;
uniform vec4 screenTextureView;
uniform mat3 screenTextureTransform;
uniform vec4 screenTextureUvMinMax;
uniform vec4 screenTextureBorderColor;
uniform vec3 sheenColorFactor;
uniform vec4 sheenColorTextureSize;
uniform vec4 sheenColorTextureView;
uniform mat3 sheenColorTextureTransform;
uniform vec4 sheenColorTextureUvMinMax;
uniform vec4 sheenColorTextureBorderColor;
uniform float sheenRoughnessFactor;
uniform vec4 sheenRoughnessTextureSize;
uniform vec4 sheenRoughnessTextureView;
uniform mat3 sheenRoughnessTextureTransform;
uniform vec4 sheenRoughnessTextureUvMinMax;
uniform vec4 sheenRoughnessTextureBorderColor;
uniform float clearcoatFactor;
uniform vec4 clearcoatTextureSize;
uniform vec4 clearcoatTextureView;
uniform mat3 clearcoatTextureTransform;
uniform vec4 clearcoatTextureUvMinMax;
uniform vec4 clearcoatTextureBorderColor;
uniform float clearcoatRoughnessFactor;
uniform vec4 clearcoatRoughnessTextureSize;
uniform vec4 clearcoatRoughnessTextureView;
uniform mat3 clearcoatRoughnessTextureTransform;
uniform vec4 clearcoatRoughnessTextureUvMinMax;
uniform vec4 clearcoatRoughnessTextureBorderColor;
uniform vec4 clearcoatNormalTextureSize;
uniform vec4 clearcoatNormalTextureView;
uniform mat3 clearcoatNormalTextureTransform;
uniform vec4 clearcoatNormalTextureUvMinMax;
uniform vec4 clearcoatNormalTextureBorderColor;
uniform vec4 baseColorTextureSize;
uniform vec4 baseColorTextureView;
uniform mat3 baseColorTextureTransform;
uniform vec4 baseColorTextureUvMinMax;
uniform vec4 baseColorTextureBorderColor;
uniform vec4 baseColorFactor;
uniform vec2 baseColorTexture_offset;
uniform vec2 baseColorTexture_scale;
uniform float baseColorTexture_rotation;
uniform vec2 emissiveTexture_offset;
uniform vec2 emissiveTexture_scale;
uniform float emissiveTexture_rotation;
uniform vec2 normalTexture_offset;
uniform vec2 normalTexture_scale;
uniform float normalTexture_rotation;
uniform vec2 metallicRoughnessTexture_offset;
uniform vec2 metallicRoughnessTexture_scale;
uniform float metallicRoughnessTexture_rotation;
uniform vec2 transmissionTexture_offset;
uniform vec2 transmissionTexture_scale;
uniform float transmissionTexture_rotation;
uniform vec2 sheenColorTexture_offset;
uniform vec2 sheenColorTexture_scale;
uniform float sheenColorTexture_rotation;
uniform vec2 sheenRoughnessTexture_offset;
uniform vec2 sheenRoughnessTexture_scale;
uniform float sheenRoughnessTexture_rotation;
uniform vec2 clearcoatTexture_offset;
uniform vec2 clearcoatTexture_scale;
uniform float clearcoatTexture_rotation;
uniform vec2 clearcoatNormalTexture_offset;
uniform vec2 clearcoatNormalTexture_scale;
uniform float clearcoatNormalTexture_rotation;
uniform vec2 clearcoatRoughnessTexture_offset;
uniform vec2 clearcoatRoughnessTexture_scale;
uniform float clearcoatRoughnessTexture_rotation;
uniform float colorMultiplier;
uniform float Port_DebugSheenEnvLightMult_N003;
uniform float Port_DebugSheenPunctualLightMult_N003;
uniform float Port_Input2_N043;
uniform float Port_Input2_N062;
uniform vec3 Port_SpecularAO_N036;
uniform vec3 Port_Albedo_N405;
uniform float Port_Opacity_N405;
uniform vec3 Port_Emissive_N405;
uniform float Port_Metallic_N405;
uniform vec3 Port_SpecularAO_N405;
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
vec3 l9_30=varPos;
vec3 l9_31=varNormal;
vec3 l9_32;
vec3 l9_33;
vec3 l9_34;
if (l9_27)
{
l9_34=varTangent.xyz;
l9_33=varNormal;
l9_32=varPos;
}
else
{
l9_34=varTangent.xyz;
l9_33=l9_31;
l9_32=l9_30;
}
varPos=l9_32;
varNormal=normalize(l9_33);
vec3 l9_35=normalize(l9_34);
varTangent=vec4(l9_35.x,l9_35.y,l9_35.z,varTangent.w);
varTangent.w=tangent.w;
#if (UseViewSpaceDepthVariant&&((sc_OITDepthGatherPass||sc_OITCompositingPass)||sc_OITDepthBoundsPass))
{
vec4 l9_36;
#if (sc_RenderingSpace==3)
{
l9_36=sc_ProjectionMatrixInverseArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
vec4 l9_37;
#if (sc_RenderingSpace==2)
{
l9_37=sc_ViewMatrixArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
vec4 l9_38;
#if (sc_RenderingSpace==1)
{
l9_38=sc_ModelViewMatrixArray[sc_GetStereoViewIndex()]*l9_17;
}
#else
{
l9_38=l9_17;
}
#endif
l9_37=l9_38;
}
#endif
l9_36=l9_37;
}
#endif
varViewSpaceDepth=-l9_36.z;
}
#endif
vec4 l9_39;
#if (sc_RenderingSpace==3)
{
l9_39=l9_17;
}
#else
{
vec4 l9_40;
#if (sc_RenderingSpace==4)
{
l9_40=(sc_ModelViewMatrixArray[sc_GetStereoViewIndex()]*l9_17)*vec4(1.0/sc_Camera.aspect,1.0,1.0,1.0);
}
#else
{
vec4 l9_41;
#if (sc_RenderingSpace==2)
{
l9_41=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(varPos,1.0);
}
#else
{
vec4 l9_42;
#if (sc_RenderingSpace==1)
{
l9_42=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(varPos,1.0);
}
#else
{
l9_42=vec4(0.0);
}
#endif
l9_41=l9_42;
}
#endif
l9_40=l9_41;
}
#endif
l9_39=l9_40;
}
#endif
varPackedTex=vec4(l9_28,l9_2);
#if (sc_ProjectiveShadowsReceiver)
{
vec4 l9_43;
#if (sc_RenderingSpace==1)
{
l9_43=sc_ModelMatrix*l9_17;
}
#else
{
l9_43=l9_17;
}
#endif
vec4 l9_44=sc_ProjectorMatrix*l9_43;
varShadowTex=((l9_44.xy/vec2(l9_44.w))*0.5)+vec2(0.5);
}
#endif
vec4 l9_45;
#if (sc_DepthBufferMode==1)
{
vec4 l9_46;
if (sc_ProjectionMatrixArray[sc_GetStereoViewIndex()][2].w!=0.0)
{
vec4 l9_47=l9_39;
l9_47.z=((log2(max(sc_Camera.clipPlanes.x,1.0+l9_39.w))*(2.0/log2(sc_Camera.clipPlanes.y+1.0)))-1.0)*l9_39.w;
l9_46=l9_47;
}
else
{
l9_46=l9_39;
}
l9_45=l9_46;
}
#else
{
l9_45=l9_39;
}
#endif
vec4 l9_48;
#if (sc_ShaderCacheConstant!=0)
{
vec4 l9_49=l9_45;
l9_49.x=l9_45.x+(sc_UniformConstants.x*float(sc_ShaderCacheConstant));
l9_48=l9_49;
}
#else
{
l9_48=l9_45;
}
#endif
#if (sc_StereoRenderingMode>0)
{
varStereoViewID=float(sc_StereoViewID);
}
#endif
#if (sc_StereoRenderingMode==1)
{
float l9_50=dot(l9_48,sc_StereoClipPlanes[sc_StereoViewID]);
#if (sc_StereoRendering_IsClipDistanceEnabled==1)
{
sc_SetClipDistancePlatform(l9_50);
}
#else
{
varClipDistance=l9_50;
}
#endif
}
#endif
gl_Position=l9_48;
}
#elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
#if 0
NGS_BACKEND_SHADER_FLAGS_BEGIN__
NGS_BACKEND_SHADER_FLAGS_END__
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
struct ssGlobals
{
float gTimeElapsed;
float gTimeDelta;
float gTimeElapsedShifted;
vec3 BumpedNormal;
vec3 ViewDirWS;
vec3 PositionWS;
vec3 SurfacePosition_WorldSpace;
vec3 VertexNormal_WorldSpace;
vec3 VertexTangent_WorldSpace;
vec3 VertexBinormal_WorldSpace;
vec2 Surface_UVCoord0;
vec2 Surface_UVCoord1;
vec2 gScreenCoord;
vec4 VertexColor;
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
#ifndef emissiveTextureHasSwappedViews
#define emissiveTextureHasSwappedViews 0
#elif emissiveTextureHasSwappedViews==1
#undef emissiveTextureHasSwappedViews
#define emissiveTextureHasSwappedViews 1
#endif
#ifndef emissiveTextureLayout
#define emissiveTextureLayout 0
#endif
#ifndef normalTextureHasSwappedViews
#define normalTextureHasSwappedViews 0
#elif normalTextureHasSwappedViews==1
#undef normalTextureHasSwappedViews
#define normalTextureHasSwappedViews 1
#endif
#ifndef normalTextureLayout
#define normalTextureLayout 0
#endif
#ifndef metallicRoughnessTextureHasSwappedViews
#define metallicRoughnessTextureHasSwappedViews 0
#elif metallicRoughnessTextureHasSwappedViews==1
#undef metallicRoughnessTextureHasSwappedViews
#define metallicRoughnessTextureHasSwappedViews 1
#endif
#ifndef metallicRoughnessTextureLayout
#define metallicRoughnessTextureLayout 0
#endif
#ifndef transmissionTextureHasSwappedViews
#define transmissionTextureHasSwappedViews 0
#elif transmissionTextureHasSwappedViews==1
#undef transmissionTextureHasSwappedViews
#define transmissionTextureHasSwappedViews 1
#endif
#ifndef transmissionTextureLayout
#define transmissionTextureLayout 0
#endif
#ifndef screenTextureHasSwappedViews
#define screenTextureHasSwappedViews 0
#elif screenTextureHasSwappedViews==1
#undef screenTextureHasSwappedViews
#define screenTextureHasSwappedViews 1
#endif
#ifndef screenTextureLayout
#define screenTextureLayout 0
#endif
#ifndef sheenColorTextureHasSwappedViews
#define sheenColorTextureHasSwappedViews 0
#elif sheenColorTextureHasSwappedViews==1
#undef sheenColorTextureHasSwappedViews
#define sheenColorTextureHasSwappedViews 1
#endif
#ifndef sheenColorTextureLayout
#define sheenColorTextureLayout 0
#endif
#ifndef sheenRoughnessTextureHasSwappedViews
#define sheenRoughnessTextureHasSwappedViews 0
#elif sheenRoughnessTextureHasSwappedViews==1
#undef sheenRoughnessTextureHasSwappedViews
#define sheenRoughnessTextureHasSwappedViews 1
#endif
#ifndef sheenRoughnessTextureLayout
#define sheenRoughnessTextureLayout 0
#endif
#ifndef clearcoatTextureHasSwappedViews
#define clearcoatTextureHasSwappedViews 0
#elif clearcoatTextureHasSwappedViews==1
#undef clearcoatTextureHasSwappedViews
#define clearcoatTextureHasSwappedViews 1
#endif
#ifndef clearcoatTextureLayout
#define clearcoatTextureLayout 0
#endif
#ifndef clearcoatRoughnessTextureHasSwappedViews
#define clearcoatRoughnessTextureHasSwappedViews 0
#elif clearcoatRoughnessTextureHasSwappedViews==1
#undef clearcoatRoughnessTextureHasSwappedViews
#define clearcoatRoughnessTextureHasSwappedViews 1
#endif
#ifndef clearcoatRoughnessTextureLayout
#define clearcoatRoughnessTextureLayout 0
#endif
#ifndef clearcoatNormalTextureHasSwappedViews
#define clearcoatNormalTextureHasSwappedViews 0
#elif clearcoatNormalTextureHasSwappedViews==1
#undef clearcoatNormalTextureHasSwappedViews
#define clearcoatNormalTextureHasSwappedViews 1
#endif
#ifndef clearcoatNormalTextureLayout
#define clearcoatNormalTextureLayout 0
#endif
#ifndef baseColorTextureHasSwappedViews
#define baseColorTextureHasSwappedViews 0
#elif baseColorTextureHasSwappedViews==1
#undef baseColorTextureHasSwappedViews
#define baseColorTextureHasSwappedViews 1
#endif
#ifndef baseColorTextureLayout
#define baseColorTextureLayout 0
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
#ifndef ENABLE_GLTF_LIGHTING
#define ENABLE_GLTF_LIGHTING 0
#elif ENABLE_GLTF_LIGHTING==1
#undef ENABLE_GLTF_LIGHTING
#define ENABLE_GLTF_LIGHTING 1
#endif
#ifndef ENABLE_TRANSMISSION
#define ENABLE_TRANSMISSION 0
#elif ENABLE_TRANSMISSION==1
#undef ENABLE_TRANSMISSION
#define ENABLE_TRANSMISSION 1
#endif
#ifndef ENABLE_SHEEN
#define ENABLE_SHEEN 0
#elif ENABLE_SHEEN==1
#undef ENABLE_SHEEN
#define ENABLE_SHEEN 1
#endif
#ifndef ENABLE_CLEARCOAT
#define ENABLE_CLEARCOAT 0
#elif ENABLE_CLEARCOAT==1
#undef ENABLE_CLEARCOAT
#define ENABLE_CLEARCOAT 1
#endif
#ifndef ENABLE_EMISSIVE
#define ENABLE_EMISSIVE 0
#elif ENABLE_EMISSIVE==1
#undef ENABLE_EMISSIVE
#define ENABLE_EMISSIVE 1
#endif
#ifndef SC_USE_UV_TRANSFORM_emissiveTexture
#define SC_USE_UV_TRANSFORM_emissiveTexture 0
#elif SC_USE_UV_TRANSFORM_emissiveTexture==1
#undef SC_USE_UV_TRANSFORM_emissiveTexture
#define SC_USE_UV_TRANSFORM_emissiveTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_emissiveTexture
#define SC_SOFTWARE_WRAP_MODE_U_emissiveTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_emissiveTexture
#define SC_SOFTWARE_WRAP_MODE_V_emissiveTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_emissiveTexture
#define SC_USE_UV_MIN_MAX_emissiveTexture 0
#elif SC_USE_UV_MIN_MAX_emissiveTexture==1
#undef SC_USE_UV_MIN_MAX_emissiveTexture
#define SC_USE_UV_MIN_MAX_emissiveTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_emissiveTexture
#define SC_USE_CLAMP_TO_BORDER_emissiveTexture 0
#elif SC_USE_CLAMP_TO_BORDER_emissiveTexture==1
#undef SC_USE_CLAMP_TO_BORDER_emissiveTexture
#define SC_USE_CLAMP_TO_BORDER_emissiveTexture 1
#endif
#ifndef NODE_10_DROPLIST_ITEM
#define NODE_10_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_NORMALMAP
#define ENABLE_NORMALMAP 0
#elif ENABLE_NORMALMAP==1
#undef ENABLE_NORMALMAP
#define ENABLE_NORMALMAP 1
#endif
#ifndef SC_USE_UV_TRANSFORM_normalTexture
#define SC_USE_UV_TRANSFORM_normalTexture 0
#elif SC_USE_UV_TRANSFORM_normalTexture==1
#undef SC_USE_UV_TRANSFORM_normalTexture
#define SC_USE_UV_TRANSFORM_normalTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_normalTexture
#define SC_SOFTWARE_WRAP_MODE_U_normalTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_normalTexture
#define SC_SOFTWARE_WRAP_MODE_V_normalTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_normalTexture
#define SC_USE_UV_MIN_MAX_normalTexture 0
#elif SC_USE_UV_MIN_MAX_normalTexture==1
#undef SC_USE_UV_MIN_MAX_normalTexture
#define SC_USE_UV_MIN_MAX_normalTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_normalTexture
#define SC_USE_CLAMP_TO_BORDER_normalTexture 0
#elif SC_USE_CLAMP_TO_BORDER_normalTexture==1
#undef SC_USE_CLAMP_TO_BORDER_normalTexture
#define SC_USE_CLAMP_TO_BORDER_normalTexture 1
#endif
#ifndef NODE_8_DROPLIST_ITEM
#define NODE_8_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_METALLIC_ROUGHNESS_TEX
#define ENABLE_METALLIC_ROUGHNESS_TEX 0
#elif ENABLE_METALLIC_ROUGHNESS_TEX==1
#undef ENABLE_METALLIC_ROUGHNESS_TEX
#define ENABLE_METALLIC_ROUGHNESS_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_metallicRoughnessTexture
#define SC_USE_UV_TRANSFORM_metallicRoughnessTexture 0
#elif SC_USE_UV_TRANSFORM_metallicRoughnessTexture==1
#undef SC_USE_UV_TRANSFORM_metallicRoughnessTexture
#define SC_USE_UV_TRANSFORM_metallicRoughnessTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_metallicRoughnessTexture
#define SC_SOFTWARE_WRAP_MODE_U_metallicRoughnessTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_metallicRoughnessTexture
#define SC_SOFTWARE_WRAP_MODE_V_metallicRoughnessTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_metallicRoughnessTexture
#define SC_USE_UV_MIN_MAX_metallicRoughnessTexture 0
#elif SC_USE_UV_MIN_MAX_metallicRoughnessTexture==1
#undef SC_USE_UV_MIN_MAX_metallicRoughnessTexture
#define SC_USE_UV_MIN_MAX_metallicRoughnessTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture
#define SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture 0
#elif SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture==1
#undef SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture
#define SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture 1
#endif
#ifndef NODE_11_DROPLIST_ITEM
#define NODE_11_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_TRANSMISSION_TEX
#define ENABLE_TRANSMISSION_TEX 0
#elif ENABLE_TRANSMISSION_TEX==1
#undef ENABLE_TRANSMISSION_TEX
#define ENABLE_TRANSMISSION_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_transmissionTexture
#define SC_USE_UV_TRANSFORM_transmissionTexture 0
#elif SC_USE_UV_TRANSFORM_transmissionTexture==1
#undef SC_USE_UV_TRANSFORM_transmissionTexture
#define SC_USE_UV_TRANSFORM_transmissionTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_transmissionTexture
#define SC_SOFTWARE_WRAP_MODE_U_transmissionTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_transmissionTexture
#define SC_SOFTWARE_WRAP_MODE_V_transmissionTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_transmissionTexture
#define SC_USE_UV_MIN_MAX_transmissionTexture 0
#elif SC_USE_UV_MIN_MAX_transmissionTexture==1
#undef SC_USE_UV_MIN_MAX_transmissionTexture
#define SC_USE_UV_MIN_MAX_transmissionTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_transmissionTexture
#define SC_USE_CLAMP_TO_BORDER_transmissionTexture 0
#elif SC_USE_CLAMP_TO_BORDER_transmissionTexture==1
#undef SC_USE_CLAMP_TO_BORDER_transmissionTexture
#define SC_USE_CLAMP_TO_BORDER_transmissionTexture 1
#endif
#ifndef Tweak_N30
#define Tweak_N30 0
#endif
#ifndef SC_USE_UV_TRANSFORM_screenTexture
#define SC_USE_UV_TRANSFORM_screenTexture 0
#elif SC_USE_UV_TRANSFORM_screenTexture==1
#undef SC_USE_UV_TRANSFORM_screenTexture
#define SC_USE_UV_TRANSFORM_screenTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_screenTexture
#define SC_SOFTWARE_WRAP_MODE_U_screenTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_screenTexture
#define SC_SOFTWARE_WRAP_MODE_V_screenTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_screenTexture
#define SC_USE_UV_MIN_MAX_screenTexture 0
#elif SC_USE_UV_MIN_MAX_screenTexture==1
#undef SC_USE_UV_MIN_MAX_screenTexture
#define SC_USE_UV_MIN_MAX_screenTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_screenTexture
#define SC_USE_CLAMP_TO_BORDER_screenTexture 0
#elif SC_USE_CLAMP_TO_BORDER_screenTexture==1
#undef SC_USE_CLAMP_TO_BORDER_screenTexture
#define SC_USE_CLAMP_TO_BORDER_screenTexture 1
#endif
#ifndef ENABLE_SHEEN_COLOR_TEX
#define ENABLE_SHEEN_COLOR_TEX 0
#elif ENABLE_SHEEN_COLOR_TEX==1
#undef ENABLE_SHEEN_COLOR_TEX
#define ENABLE_SHEEN_COLOR_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_sheenColorTexture
#define SC_USE_UV_TRANSFORM_sheenColorTexture 0
#elif SC_USE_UV_TRANSFORM_sheenColorTexture==1
#undef SC_USE_UV_TRANSFORM_sheenColorTexture
#define SC_USE_UV_TRANSFORM_sheenColorTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_sheenColorTexture
#define SC_SOFTWARE_WRAP_MODE_U_sheenColorTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_sheenColorTexture
#define SC_SOFTWARE_WRAP_MODE_V_sheenColorTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_sheenColorTexture
#define SC_USE_UV_MIN_MAX_sheenColorTexture 0
#elif SC_USE_UV_MIN_MAX_sheenColorTexture==1
#undef SC_USE_UV_MIN_MAX_sheenColorTexture
#define SC_USE_UV_MIN_MAX_sheenColorTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_sheenColorTexture
#define SC_USE_CLAMP_TO_BORDER_sheenColorTexture 0
#elif SC_USE_CLAMP_TO_BORDER_sheenColorTexture==1
#undef SC_USE_CLAMP_TO_BORDER_sheenColorTexture
#define SC_USE_CLAMP_TO_BORDER_sheenColorTexture 1
#endif
#ifndef Tweak_N32
#define Tweak_N32 0
#endif
#ifndef ENABLE_SHEEN_ROUGHNESS_TEX
#define ENABLE_SHEEN_ROUGHNESS_TEX 0
#elif ENABLE_SHEEN_ROUGHNESS_TEX==1
#undef ENABLE_SHEEN_ROUGHNESS_TEX
#define ENABLE_SHEEN_ROUGHNESS_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_sheenRoughnessTexture
#define SC_USE_UV_TRANSFORM_sheenRoughnessTexture 0
#elif SC_USE_UV_TRANSFORM_sheenRoughnessTexture==1
#undef SC_USE_UV_TRANSFORM_sheenRoughnessTexture
#define SC_USE_UV_TRANSFORM_sheenRoughnessTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_sheenRoughnessTexture
#define SC_SOFTWARE_WRAP_MODE_U_sheenRoughnessTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_sheenRoughnessTexture
#define SC_SOFTWARE_WRAP_MODE_V_sheenRoughnessTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_sheenRoughnessTexture
#define SC_USE_UV_MIN_MAX_sheenRoughnessTexture 0
#elif SC_USE_UV_MIN_MAX_sheenRoughnessTexture==1
#undef SC_USE_UV_MIN_MAX_sheenRoughnessTexture
#define SC_USE_UV_MIN_MAX_sheenRoughnessTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture
#define SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture 0
#elif SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture==1
#undef SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture
#define SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture 1
#endif
#ifndef Tweak_N37
#define Tweak_N37 0
#endif
#ifndef ENABLE_CLEARCOAT_TEX
#define ENABLE_CLEARCOAT_TEX 0
#elif ENABLE_CLEARCOAT_TEX==1
#undef ENABLE_CLEARCOAT_TEX
#define ENABLE_CLEARCOAT_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_clearcoatTexture
#define SC_USE_UV_TRANSFORM_clearcoatTexture 0
#elif SC_USE_UV_TRANSFORM_clearcoatTexture==1
#undef SC_USE_UV_TRANSFORM_clearcoatTexture
#define SC_USE_UV_TRANSFORM_clearcoatTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_clearcoatTexture
#define SC_SOFTWARE_WRAP_MODE_U_clearcoatTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_clearcoatTexture
#define SC_SOFTWARE_WRAP_MODE_V_clearcoatTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_clearcoatTexture
#define SC_USE_UV_MIN_MAX_clearcoatTexture 0
#elif SC_USE_UV_MIN_MAX_clearcoatTexture==1
#undef SC_USE_UV_MIN_MAX_clearcoatTexture
#define SC_USE_UV_MIN_MAX_clearcoatTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_clearcoatTexture
#define SC_USE_CLAMP_TO_BORDER_clearcoatTexture 0
#elif SC_USE_CLAMP_TO_BORDER_clearcoatTexture==1
#undef SC_USE_CLAMP_TO_BORDER_clearcoatTexture
#define SC_USE_CLAMP_TO_BORDER_clearcoatTexture 1
#endif
#ifndef Tweak_N44
#define Tweak_N44 0
#endif
#ifndef ENABLE_CLEARCOAT_ROUGHNESS_TEX
#define ENABLE_CLEARCOAT_ROUGHNESS_TEX 0
#elif ENABLE_CLEARCOAT_ROUGHNESS_TEX==1
#undef ENABLE_CLEARCOAT_ROUGHNESS_TEX
#define ENABLE_CLEARCOAT_ROUGHNESS_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_clearcoatRoughnessTexture
#define SC_USE_UV_TRANSFORM_clearcoatRoughnessTexture 0
#elif SC_USE_UV_TRANSFORM_clearcoatRoughnessTexture==1
#undef SC_USE_UV_TRANSFORM_clearcoatRoughnessTexture
#define SC_USE_UV_TRANSFORM_clearcoatRoughnessTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_clearcoatRoughnessTexture
#define SC_SOFTWARE_WRAP_MODE_U_clearcoatRoughnessTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_clearcoatRoughnessTexture
#define SC_SOFTWARE_WRAP_MODE_V_clearcoatRoughnessTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_clearcoatRoughnessTexture
#define SC_USE_UV_MIN_MAX_clearcoatRoughnessTexture 0
#elif SC_USE_UV_MIN_MAX_clearcoatRoughnessTexture==1
#undef SC_USE_UV_MIN_MAX_clearcoatRoughnessTexture
#define SC_USE_UV_MIN_MAX_clearcoatRoughnessTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture
#define SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture 0
#elif SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture==1
#undef SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture
#define SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture 1
#endif
#ifndef Tweak_N60
#define Tweak_N60 0
#endif
#ifndef ENABLE_CLEARCOAT_NORMAL_TEX
#define ENABLE_CLEARCOAT_NORMAL_TEX 0
#elif ENABLE_CLEARCOAT_NORMAL_TEX==1
#undef ENABLE_CLEARCOAT_NORMAL_TEX
#define ENABLE_CLEARCOAT_NORMAL_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_clearcoatNormalTexture
#define SC_USE_UV_TRANSFORM_clearcoatNormalTexture 0
#elif SC_USE_UV_TRANSFORM_clearcoatNormalTexture==1
#undef SC_USE_UV_TRANSFORM_clearcoatNormalTexture
#define SC_USE_UV_TRANSFORM_clearcoatNormalTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_clearcoatNormalTexture
#define SC_SOFTWARE_WRAP_MODE_U_clearcoatNormalTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_clearcoatNormalTexture
#define SC_SOFTWARE_WRAP_MODE_V_clearcoatNormalTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_clearcoatNormalTexture
#define SC_USE_UV_MIN_MAX_clearcoatNormalTexture 0
#elif SC_USE_UV_MIN_MAX_clearcoatNormalTexture==1
#undef SC_USE_UV_MIN_MAX_clearcoatNormalTexture
#define SC_USE_UV_MIN_MAX_clearcoatNormalTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture
#define SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture 0
#elif SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture==1
#undef SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture
#define SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture 1
#endif
#ifndef Tweak_N47
#define Tweak_N47 0
#endif
#ifndef ENABLE_TEXTURE_TRANSFORM
#define ENABLE_TEXTURE_TRANSFORM 0
#elif ENABLE_TEXTURE_TRANSFORM==1
#undef ENABLE_TEXTURE_TRANSFORM
#define ENABLE_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_EMISSIVE_TEXTURE_TRANSFORM
#define ENABLE_EMISSIVE_TEXTURE_TRANSFORM 0
#elif ENABLE_EMISSIVE_TEXTURE_TRANSFORM==1
#undef ENABLE_EMISSIVE_TEXTURE_TRANSFORM
#define ENABLE_EMISSIVE_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_NORMAL_TEXTURE_TRANSFORM
#define ENABLE_NORMAL_TEXTURE_TRANSFORM 0
#elif ENABLE_NORMAL_TEXTURE_TRANSFORM==1
#undef ENABLE_NORMAL_TEXTURE_TRANSFORM
#define ENABLE_NORMAL_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_METALLIC_ROUGHNESS_TEXTURE_TRANSFORM
#define ENABLE_METALLIC_ROUGHNESS_TEXTURE_TRANSFORM 0
#elif ENABLE_METALLIC_ROUGHNESS_TEXTURE_TRANSFORM==1
#undef ENABLE_METALLIC_ROUGHNESS_TEXTURE_TRANSFORM
#define ENABLE_METALLIC_ROUGHNESS_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_TRANSMISSION_TEXTURE_TRANSFORM
#define ENABLE_TRANSMISSION_TEXTURE_TRANSFORM 0
#elif ENABLE_TRANSMISSION_TEXTURE_TRANSFORM==1
#undef ENABLE_TRANSMISSION_TEXTURE_TRANSFORM
#define ENABLE_TRANSMISSION_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_SHEEN_COLOR_TEXTURE_TRANSFORM
#define ENABLE_SHEEN_COLOR_TEXTURE_TRANSFORM 0
#elif ENABLE_SHEEN_COLOR_TEXTURE_TRANSFORM==1
#undef ENABLE_SHEEN_COLOR_TEXTURE_TRANSFORM
#define ENABLE_SHEEN_COLOR_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_SHEEN_ROUGHNESS_TEXTURE_TRANSFORM
#define ENABLE_SHEEN_ROUGHNESS_TEXTURE_TRANSFORM 0
#elif ENABLE_SHEEN_ROUGHNESS_TEXTURE_TRANSFORM==1
#undef ENABLE_SHEEN_ROUGHNESS_TEXTURE_TRANSFORM
#define ENABLE_SHEEN_ROUGHNESS_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_CLEARCOAT_TEXTURE_TRANSFORM
#define ENABLE_CLEARCOAT_TEXTURE_TRANSFORM 0
#elif ENABLE_CLEARCOAT_TEXTURE_TRANSFORM==1
#undef ENABLE_CLEARCOAT_TEXTURE_TRANSFORM
#define ENABLE_CLEARCOAT_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_CLEARCOAT_NORMAL_TEXTURE_TRANSFORM
#define ENABLE_CLEARCOAT_NORMAL_TEXTURE_TRANSFORM 0
#elif ENABLE_CLEARCOAT_NORMAL_TEXTURE_TRANSFORM==1
#undef ENABLE_CLEARCOAT_NORMAL_TEXTURE_TRANSFORM
#define ENABLE_CLEARCOAT_NORMAL_TEXTURE_TRANSFORM 1
#endif
#ifndef ENABLE_CLEARCOAT_ROUGHNESS_TEXTURE_TRANSFORM
#define ENABLE_CLEARCOAT_ROUGHNESS_TEXTURE_TRANSFORM 0
#elif ENABLE_CLEARCOAT_ROUGHNESS_TEXTURE_TRANSFORM==1
#undef ENABLE_CLEARCOAT_ROUGHNESS_TEXTURE_TRANSFORM
#define ENABLE_CLEARCOAT_ROUGHNESS_TEXTURE_TRANSFORM 1
#endif
struct sc_Camera_t
{
vec3 position;
float aspect;
vec2 clipPlanes;
};
#ifndef ENABLE_VERTEX_COLOR_BASE
#define ENABLE_VERTEX_COLOR_BASE 0
#elif ENABLE_VERTEX_COLOR_BASE==1
#undef ENABLE_VERTEX_COLOR_BASE
#define ENABLE_VERTEX_COLOR_BASE 1
#endif
#ifndef ENABLE_BASE_TEX
#define ENABLE_BASE_TEX 0
#elif ENABLE_BASE_TEX==1
#undef ENABLE_BASE_TEX
#define ENABLE_BASE_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_baseColorTexture
#define SC_USE_UV_TRANSFORM_baseColorTexture 0
#elif SC_USE_UV_TRANSFORM_baseColorTexture==1
#undef SC_USE_UV_TRANSFORM_baseColorTexture
#define SC_USE_UV_TRANSFORM_baseColorTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseColorTexture
#define SC_SOFTWARE_WRAP_MODE_U_baseColorTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseColorTexture
#define SC_SOFTWARE_WRAP_MODE_V_baseColorTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseColorTexture
#define SC_USE_UV_MIN_MAX_baseColorTexture 0
#elif SC_USE_UV_MIN_MAX_baseColorTexture==1
#undef SC_USE_UV_MIN_MAX_baseColorTexture
#define SC_USE_UV_MIN_MAX_baseColorTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseColorTexture
#define SC_USE_CLAMP_TO_BORDER_baseColorTexture 0
#elif SC_USE_CLAMP_TO_BORDER_baseColorTexture==1
#undef SC_USE_CLAMP_TO_BORDER_baseColorTexture
#define SC_USE_CLAMP_TO_BORDER_baseColorTexture 1
#endif
#ifndef NODE_7_DROPLIST_ITEM
#define NODE_7_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_BASE_TEXTURE_TRANSFORM
#define ENABLE_BASE_TEXTURE_TRANSFORM 0
#elif ENABLE_BASE_TEXTURE_TRANSFORM==1
#undef ENABLE_BASE_TEXTURE_TRANSFORM
#define ENABLE_BASE_TEXTURE_TRANSFORM 1
#endif
#ifndef sc_DepthOnly
#define sc_DepthOnly 0
#elif sc_DepthOnly==1
#undef sc_DepthOnly
#define sc_DepthOnly 1
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
uniform vec4 emissiveTextureDims;
uniform vec4 normalTextureDims;
uniform vec4 metallicRoughnessTextureDims;
uniform vec4 transmissionTextureDims;
uniform vec4 screenTextureDims;
uniform vec4 sheenColorTextureDims;
uniform vec4 sheenRoughnessTextureDims;
uniform vec4 clearcoatTextureDims;
uniform vec4 clearcoatRoughnessTextureDims;
uniform vec4 clearcoatNormalTextureDims;
uniform vec4 baseColorTextureDims;
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
uniform mat3 emissiveTextureTransform;
uniform vec4 emissiveTextureUvMinMax;
uniform vec4 emissiveTextureBorderColor;
uniform mat3 normalTextureTransform;
uniform vec4 normalTextureUvMinMax;
uniform vec4 normalTextureBorderColor;
uniform mat3 metallicRoughnessTextureTransform;
uniform vec4 metallicRoughnessTextureUvMinMax;
uniform vec4 metallicRoughnessTextureBorderColor;
uniform mat3 transmissionTextureTransform;
uniform vec4 transmissionTextureUvMinMax;
uniform vec4 transmissionTextureBorderColor;
uniform mat3 screenTextureTransform;
uniform vec4 screenTextureUvMinMax;
uniform vec4 screenTextureBorderColor;
uniform mat3 sheenColorTextureTransform;
uniform vec4 sheenColorTextureUvMinMax;
uniform vec4 sheenColorTextureBorderColor;
uniform mat3 sheenRoughnessTextureTransform;
uniform vec4 sheenRoughnessTextureUvMinMax;
uniform vec4 sheenRoughnessTextureBorderColor;
uniform mat3 clearcoatTextureTransform;
uniform vec4 clearcoatTextureUvMinMax;
uniform vec4 clearcoatTextureBorderColor;
uniform mat3 clearcoatRoughnessTextureTransform;
uniform vec4 clearcoatRoughnessTextureUvMinMax;
uniform vec4 clearcoatRoughnessTextureBorderColor;
uniform mat3 clearcoatNormalTextureTransform;
uniform vec4 clearcoatNormalTextureUvMinMax;
uniform vec4 clearcoatNormalTextureBorderColor;
uniform sc_Camera_t sc_Camera;
uniform vec3 emissiveFactor;
uniform float normalTextureScale;
uniform float metallicFactor;
uniform float roughnessFactor;
uniform float occlusionTextureStrength;
uniform float transmissionFactor;
uniform vec3 sheenColorFactor;
uniform float sheenRoughnessFactor;
uniform float clearcoatFactor;
uniform float clearcoatRoughnessFactor;
uniform mat3 baseColorTextureTransform;
uniform vec4 baseColorTextureUvMinMax;
uniform vec4 baseColorTextureBorderColor;
uniform vec4 baseColorFactor;
uniform vec2 baseColorTexture_offset;
uniform vec2 baseColorTexture_scale;
uniform float baseColorTexture_rotation;
uniform vec2 emissiveTexture_offset;
uniform vec2 emissiveTexture_scale;
uniform float emissiveTexture_rotation;
uniform vec2 normalTexture_offset;
uniform vec2 normalTexture_scale;
uniform float normalTexture_rotation;
uniform vec2 metallicRoughnessTexture_offset;
uniform vec2 metallicRoughnessTexture_scale;
uniform float metallicRoughnessTexture_rotation;
uniform vec2 transmissionTexture_offset;
uniform vec2 transmissionTexture_scale;
uniform float transmissionTexture_rotation;
uniform vec2 sheenColorTexture_offset;
uniform vec2 sheenColorTexture_scale;
uniform float sheenColorTexture_rotation;
uniform vec2 sheenRoughnessTexture_offset;
uniform vec2 sheenRoughnessTexture_scale;
uniform float sheenRoughnessTexture_rotation;
uniform vec2 clearcoatTexture_offset;
uniform vec2 clearcoatTexture_scale;
uniform float clearcoatTexture_rotation;
uniform vec2 clearcoatNormalTexture_offset;
uniform vec2 clearcoatNormalTexture_scale;
uniform float clearcoatNormalTexture_rotation;
uniform vec2 clearcoatRoughnessTexture_offset;
uniform vec2 clearcoatRoughnessTexture_scale;
uniform float clearcoatRoughnessTexture_rotation;
uniform float Port_Input2_N043;
uniform float Port_Input2_N062;
uniform float Port_DebugSheenEnvLightMult_N003;
uniform float Port_DebugSheenPunctualLightMult_N003;
uniform vec3 Port_SpecularAO_N036;
uniform vec3 Port_Albedo_N405;
uniform float Port_Opacity_N405;
uniform vec3 Port_Emissive_N405;
uniform float Port_Metallic_N405;
uniform vec3 Port_SpecularAO_N405;
uniform float colorMultiplier;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform float overrideTimeDelta;
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
uniform vec4 emissiveTextureSize;
uniform vec4 emissiveTextureView;
uniform vec4 normalTextureSize;
uniform vec4 normalTextureView;
uniform vec4 metallicRoughnessTextureSize;
uniform vec4 metallicRoughnessTextureView;
uniform vec4 transmissionTextureSize;
uniform vec4 transmissionTextureView;
uniform vec4 screenTextureSize;
uniform vec4 screenTextureView;
uniform vec4 sheenColorTextureSize;
uniform vec4 sheenColorTextureView;
uniform vec4 sheenRoughnessTextureSize;
uniform vec4 sheenRoughnessTextureView;
uniform vec4 clearcoatTextureSize;
uniform vec4 clearcoatTextureView;
uniform vec4 clearcoatRoughnessTextureSize;
uniform vec4 clearcoatRoughnessTextureView;
uniform vec4 clearcoatNormalTextureSize;
uniform vec4 clearcoatNormalTextureView;
uniform vec4 baseColorTextureSize;
uniform vec4 baseColorTextureView;
uniform sampler2D baseColorTexture;
uniform sampler2D emissiveTexture;
uniform sampler2D normalTexture;
uniform sampler2D metallicRoughnessTexture;
uniform sampler2D screenTexture;
uniform sampler2D transmissionTexture;
uniform sampler2D sheenColorTexture;
uniform sampler2D sheenRoughnessTexture;
uniform sampler2D sc_EnvmapSpecular;
uniform sampler2D clearcoatTexture;
uniform sampler2D clearcoatRoughnessTexture;
uniform sampler2D clearcoatNormalTexture;
uniform sampler2D sc_SSAOTexture;
uniform sampler2D sc_ShadowTexture;
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
varying vec4 varTangent;
varying vec4 varPackedTex;
varying vec4 varColor;
varying vec4 varScreenPos;
varying vec2 varScreenTexturePos;
vec4 N31_PbrIn;
bool N31_EnableTransmission;
float N31_Opacity;
vec3 N31_Background;
bool N31_EnableSheen;
vec4 N31_SheenColor;
bool N31_EnableClearcoat;
float N31_ClearcoatBase;
vec4 N31_ClearcoatColor;
vec4 N31_Result;
float N3_DebugSheenEnvLightMult;
float N3_DebugSheenPunctualLightMult;
vec3 N3_EmissiveColor;
bool N3_EnableEmissiveTexture;
int N3_EmissiveTextureCoord;
bool N3_EnableNormalTexture;
float N3_NormalScale;
int N3_NormalTextureCoord;
float N3_MetallicValue;
float N3_RoughnessValue;
bool N3_EnableMetallicRoughnessTexture;
float N3_OcclusionStrength;
int N3_MaterialParamsTextureCoord;
bool N3_TransmissionEnable;
float N3_TransmissionFactor;
bool N3_EnableTransmissionTexture;
int N3_TransmissionTextureCoord;
bool N3_SheenEnable;
vec3 N3_SheenColorFactor;
bool N3_EnableSheenTexture;
int N3_SheenColorTextureCoord;
float N3_SheenRoughnessFactor;
bool N3_EnableSheenRoughnessTexture;
int N3_SheenRoughnessTextureCoord;
bool N3_ClearcoatEnable;
float N3_ClearcoatFactor;
bool N3_EnableClearcoatTexture;
int N3_ClearcoatTextureCoord;
float N3_ClearcoatRoughnessFactor;
bool N3_EnableClearCoatRoughnessTexture;
int N3_ClearcoatRoughnessTextureCoord;
bool N3_EnableClearCoatNormalTexture;
int N3_ClearcoatNormalMapCoord;
vec3 N3_BaseColorIn;
float N3_OpacityIn;
bool N3_EnableTextureTransform;
bool N3_EmissiveTextureTransform;
vec2 N3_EmissiveTextureOffset;
vec2 N3_EmissiveTextureScale;
float N3_EmissiveTextureRotation;
bool N3_NormalTextureTransform;
vec2 N3_NormalTextureOffset;
vec2 N3_NormalTextureScale;
float N3_NormalTextureRotation;
bool N3_MaterialParamsTextureTransform;
vec2 N3_MaterialParamsTextureOffset;
vec2 N3_MaterialParamsTextureScale;
float N3_MaterialParamsTextureRotation;
bool N3_TransmissionTextureTransform;
vec2 N3_TransmissionTextureOffset;
vec2 N3_TransmissionTextureScale;
float N3_TransmissionTextureRotation;
bool N3_SheenColorTextureTransform;
vec2 N3_SheenColorTextureOffset;
vec2 N3_SheenColorTextureScale;
float N3_SheenColorTextureRotation;
bool N3_SheenRoughnessTextureTransform;
vec2 N3_SheenRoughnessTextureOffset;
vec2 N3_SheenRoughnessTextureScale;
float N3_SheenRoughnessTextureRotation;
bool N3_ClearcoatTextureTransform;
vec2 N3_ClearcoatTextureOffset;
vec2 N3_ClearcoatTextureScale;
float N3_ClearcoatTextureRotation;
bool N3_ClearcoatNormalTextureTransform;
vec2 N3_ClearcoatNormalTextureOffset;
vec2 N3_ClearcoatNormalTextureScale;
float N3_ClearcoatNormalTextureRotation;
bool N3_ClearcoatRoughnessTextureTransform;
vec2 N3_ClearcoatRoughnessTextureOffset;
vec2 N3_ClearcoatRoughnessTextureScale;
float N3_ClearcoatRoughnessTextureRotation;
vec3 N3_BaseColor;
float N3_Opacity;
vec3 N3_Normal;
vec3 N3_Emissive;
float N3_Metallic;
float N3_Roughness;
vec4 N3_Occlusion;
vec3 N3_Background;
vec4 N3_SheenOut;
float N3_ClearcoatBase;
vec3 N3_ClearcoatNormal;
float N3_ClearcoatRoughness;
bool N35_EnableVertexColor;
bool N35_EnableBaseTexture;
int N35_BaseColorTextureCoord;
vec4 N35_BaseColorFactor;
bool N35_EnableTextureTransform;
bool N35_BaseTextureTransform;
vec2 N35_BaseTextureOffset;
vec2 N35_BaseTextureScale;
float N35_BaseTextureRotation;
vec3 N35_BaseColor;
float N35_Opacity;
vec4 N35_UnlitColor;
ssGlobals tempGlobals;
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
void Node40_Bool_Parameter(out float Output,ssGlobals Globals)
{
#if (ENABLE_VERTEX_COLOR_BASE)
{
Output=1.001;
}
#else
{
Output=0.001;
}
#endif
Output-=0.001;
}
void Node121_Bool_Parameter(out float Output,ssGlobals Globals)
{
#if (ENABLE_BASE_TEX)
{
Output=1.001;
}
#else
{
Output=0.001;
}
#endif
Output-=0.001;
}
void Node48_Bool_Parameter(out float Output,ssGlobals Globals)
{
#if (ENABLE_TEXTURE_TRANSFORM)
{
Output=1.001;
}
#else
{
Output=0.001;
}
#endif
Output-=0.001;
}
void Node88_Bool_Parameter(out float Output,ssGlobals Globals)
{
#if (ENABLE_BASE_TEXTURE_TRANSFORM)
{
Output=1.001;
}
#else
{
Output=0.001;
}
#endif
Output-=0.001;
}
vec2 N35_getUV(int pickUV)
{
vec2 l9_0=tempGlobals.Surface_UVCoord0;
vec2 l9_1;
if (pickUV==0)
{
l9_1=tempGlobals.Surface_UVCoord0;
}
else
{
l9_1=l9_0;
}
vec2 l9_2;
if (pickUV==1)
{
l9_2=tempGlobals.Surface_UVCoord1;
}
else
{
l9_2=l9_1;
}
return l9_2;
}
vec2 N35_uvTransform(vec2 uvIn,vec2 offset,vec2 scale,float rotation)
{
return (((mat3(vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),vec3(offset.x,offset.y,1.0))*mat3(vec3(cos(rotation),sin(rotation),0.0),vec3(-sin(rotation),cos(rotation),0.0),vec3(0.0,0.0,1.0)))*mat3(vec3(scale.x,0.0,0.0),vec3(0.0,scale.y,0.0),vec3(0.0,0.0,1.0)))*vec3(uvIn,1.0)).xy;
}
int baseColorTextureGetStereoViewIndex()
{
int l9_0;
#if (baseColorTextureHasSwappedViews)
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
vec4 N35_BaseTexture_sample(vec2 coords)
{
float l9_0=coords.x;
sc_SoftwareWrapEarly(l9_0,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseColorTexture,SC_SOFTWARE_WRAP_MODE_V_baseColorTexture).x);
float l9_1=l9_0;
float l9_2=coords.y;
sc_SoftwareWrapEarly(l9_2,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseColorTexture,SC_SOFTWARE_WRAP_MODE_V_baseColorTexture).y);
float l9_3=l9_2;
vec2 l9_4;
float l9_5;
#if (SC_USE_UV_MIN_MAX_baseColorTexture)
{
bool l9_6;
#if (SC_USE_CLAMP_TO_BORDER_baseColorTexture)
{
l9_6=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseColorTexture,SC_SOFTWARE_WRAP_MODE_V_baseColorTexture).x==3;
}
#else
{
l9_6=(int(SC_USE_CLAMP_TO_BORDER_baseColorTexture)!=0);
}
#endif
float l9_7=l9_1;
float l9_8=1.0;
sc_ClampUV(l9_7,baseColorTextureUvMinMax.x,baseColorTextureUvMinMax.z,l9_6,l9_8);
float l9_9=l9_7;
float l9_10=l9_8;
bool l9_11;
#if (SC_USE_CLAMP_TO_BORDER_baseColorTexture)
{
l9_11=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseColorTexture,SC_SOFTWARE_WRAP_MODE_V_baseColorTexture).y==3;
}
#else
{
l9_11=(int(SC_USE_CLAMP_TO_BORDER_baseColorTexture)!=0);
}
#endif
float l9_12=l9_3;
float l9_13=l9_10;
sc_ClampUV(l9_12,baseColorTextureUvMinMax.y,baseColorTextureUvMinMax.w,l9_11,l9_13);
l9_5=l9_13;
l9_4=vec2(l9_9,l9_12);
}
#else
{
l9_5=1.0;
l9_4=vec2(l9_1,l9_3);
}
#endif
vec2 l9_14=sc_TransformUV(l9_4,(int(SC_USE_UV_TRANSFORM_baseColorTexture)!=0),baseColorTextureTransform);
float l9_15=l9_14.x;
float l9_16=l9_5;
sc_SoftwareWrapLate(l9_15,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseColorTexture,SC_SOFTWARE_WRAP_MODE_V_baseColorTexture).x,(int(SC_USE_CLAMP_TO_BORDER_baseColorTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseColorTexture)!=0)),l9_16);
float l9_17=l9_14.y;
float l9_18=l9_16;
sc_SoftwareWrapLate(l9_17,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseColorTexture,SC_SOFTWARE_WRAP_MODE_V_baseColorTexture).y,(int(SC_USE_CLAMP_TO_BORDER_baseColorTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseColorTexture)!=0)),l9_18);
float l9_19=l9_18;
vec3 l9_20=sc_SamplingCoordsViewToGlobal(vec2(l9_15,l9_17),baseColorTextureLayout,baseColorTextureGetStereoViewIndex());
vec4 l9_21=texture2D(baseColorTexture,l9_20.xy,0.0);
vec4 l9_22;
#if (SC_USE_CLAMP_TO_BORDER_baseColorTexture)
{
l9_22=mix(baseColorTextureBorderColor,l9_21,vec4(l9_19));
}
#else
{
l9_22=l9_21;
}
#endif
return l9_22;
}
vec4 ssSRGB_to_Linear(vec4 value)
{
vec4 l9_0;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_0=vec4(pow(value.x,2.2),pow(value.y,2.2),pow(value.z,2.2),pow(value.w,2.2));
}
#else
{
l9_0=value*value;
}
#endif
return l9_0;
}
vec4 ssLinear_to_SRGB(vec4 value)
{
vec4 l9_0;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_0=vec4(pow(value.x,0.45454544),pow(value.y,0.45454544),pow(value.z,0.45454544),pow(value.w,0.45454544));
}
#else
{
l9_0=sqrt(value);
}
#endif
return l9_0;
}
void Node35_Unlit(float EnableVertexColor,float EnableBaseTexture,float BaseColorTextureCoord,vec4 BaseColorFactor,float EnableTextureTransform,float BaseTextureTransform,vec2 BaseTextureOffset,vec2 BaseTextureScale,float BaseTextureRotation,out vec3 BaseColor,out float Opacity,out vec4 UnlitColor,ssGlobals Globals)
{
tempGlobals=Globals;
BaseColor=vec3(0.0);
Opacity=0.0;
UnlitColor=vec4(0.0);
N35_EnableVertexColor=(int(ENABLE_VERTEX_COLOR_BASE)!=0);
N35_EnableBaseTexture=(int(ENABLE_BASE_TEX)!=0);
N35_BaseColorTextureCoord=NODE_7_DROPLIST_ITEM;
N35_BaseColorFactor=BaseColorFactor;
N35_EnableTextureTransform=(int(ENABLE_TEXTURE_TRANSFORM)!=0);
N35_BaseTextureTransform=(int(ENABLE_BASE_TEXTURE_TRANSFORM)!=0);
N35_BaseTextureOffset=BaseTextureOffset;
N35_BaseTextureScale=BaseTextureScale;
N35_BaseTextureRotation=BaseTextureRotation;
vec4 l9_0=N35_BaseColorFactor;
vec4 l9_1;
if (N35_EnableBaseTexture)
{
vec2 l9_2=N35_getUV(N35_BaseColorTextureCoord);
vec2 l9_3;
if (N35_EnableTextureTransform&&N35_BaseTextureTransform)
{
l9_3=N35_uvTransform(l9_2,N35_BaseTextureOffset,N35_BaseTextureScale,N35_BaseTextureRotation);
}
else
{
l9_3=l9_2;
}
l9_1=l9_0*ssSRGB_to_Linear(N35_BaseTexture_sample(l9_3));
}
else
{
l9_1=l9_0;
}
vec4 l9_4;
if (N35_EnableVertexColor)
{
l9_4=l9_1*tempGlobals.VertexColor;
}
else
{
l9_4=l9_1;
}
N35_BaseColor=l9_4.xyz;
N35_Opacity=l9_4.w;
N35_UnlitColor=ssLinear_to_SRGB(l9_4);
BaseColor=N35_BaseColor;
Opacity=N35_Opacity;
UnlitColor=N35_UnlitColor;
}
vec2 N3_getUV(int pickUV)
{
vec2 l9_0=tempGlobals.Surface_UVCoord0;
vec2 l9_1;
if (pickUV==0)
{
l9_1=tempGlobals.Surface_UVCoord0;
}
else
{
l9_1=l9_0;
}
vec2 l9_2;
if (pickUV==1)
{
l9_2=tempGlobals.Surface_UVCoord1;
}
else
{
l9_2=l9_1;
}
return l9_2;
}
vec2 N3_uvTransform(vec2 uvIn,vec2 offset,vec2 scale,float rotationAngle)
{
float l9_0=radians(rotationAngle);
float l9_1=cos(l9_0);
float l9_2=sin(l9_0);
return (((mat3(vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),vec3(offset.x,offset.y,1.0))*mat3(vec3(l9_1,l9_2,0.0),vec3(-l9_2,l9_1,0.0),vec3(0.0,0.0,1.0)))*mat3(vec3(scale.x,0.0,0.0),vec3(0.0,scale.y,0.0),vec3(0.0,0.0,1.0)))*vec3(uvIn,1.0)).xy;
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
vec3 ssLinear_to_SRGB(vec3 value)
{
vec3 l9_0;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_0=vec3(pow(value.x,0.45454544),pow(value.y,0.45454544),pow(value.z,0.45454544));
}
#else
{
l9_0=sqrt(value);
}
#endif
return l9_0;
}
float ssSRGB_to_Linear(float value)
{
float l9_0;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_0=pow(value,2.2);
}
#else
{
l9_0=value*value;
}
#endif
return l9_0;
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
vec3 sampleSpecularEnvTextureLod(vec3 R,float lod)
{
vec2 l9_0=calcPanoramicTexCoordsFromDir(R,sc_EnvmapRotation.y);
vec4 l9_1;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
float l9_2=floor(lod);
float l9_3=ceil(lod);
l9_1=mix(sc_EnvmapSpecularSampleViewIndexLevel(calcSeamlessPanoramicUvsForSampling(l9_0,sc_EnvmapSpecularSize.xy,l9_2),sc_EnvmapSpecularGetStereoViewIndex(),l9_2),sc_EnvmapSpecularSampleViewIndexLevel(calcSeamlessPanoramicUvsForSampling(l9_0,sc_EnvmapSpecularSize.xy,l9_3),sc_EnvmapSpecularGetStereoViewIndex(),l9_3),vec4(lod-l9_2));
}
#else
{
l9_1=sc_EnvmapSpecularSampleViewIndexLevel(l9_0,sc_EnvmapSpecularGetStereoViewIndex(),lod);
}
#endif
return l9_1.xyz*(1.0/l9_1.w);
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
float N3_charlieD(float roughness,float NdotH)
{
float l9_0=1.0/roughness;
return ((2.0+l9_0)*ssPow(1.0-(NdotH*NdotH),l9_0*0.5))/(2.0*3.1415927);
}
void ngsAlphaTest(float opacity)
{
#if (sc_BlendMode_AlphaTest)
{
if (opacity<alphaTestThreshold)
{
discard;
}
}
#endif
#if (ENABLE_STIPPLE_PATTERN_TEST)
{
if (opacity<((mod(dot(floor(mod(gl_FragCoord.xy,vec2(4.0))),vec2(4.0,1.0))*9.0,16.0)+1.0)/17.0))
{
discard;
}
}
#endif
}
SurfaceProperties defaultSurfaceProperties()
{
return SurfaceProperties(vec3(0.0),1.0,vec3(0.0),vec3(0.0),vec3(0.0),0.0,0.0,vec3(0.0),vec3(1.0),vec3(1.0),vec3(1.0),vec3(0.0));
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
void deriveAlbedoAndSpecColorFromSurfaceProperties(SurfaceProperties surfaceProperties,out vec3 albedo,out vec3 specColor)
{
specColor=mix(vec3(0.039999999),surfaceProperties.albedo*surfaceProperties.metallic,vec3(surfaceProperties.metallic));
albedo=mix(surfaceProperties.albedo*(1.0-surfaceProperties.metallic),vec3(0.0),vec3(surfaceProperties.metallic));
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
vec3 evaluateShadow()
{
vec3 l9_0;
#if (sc_ProjectiveShadowsReceiver)
{
vec2 l9_1=abs(varShadowTex-vec2(0.5));
vec4 l9_2=texture2D(sc_ShadowTexture,varShadowTex)*step(max(l9_1.x,l9_1.y),0.5);
l9_0=mix(vec3(1.0),mix(sc_ShadowColor.xyz,sc_ShadowColor.xyz*l9_2.xyz,vec3(sc_ShadowColor.w)),vec3(l9_2.w*sc_ShadowDensity));
}
#else
{
l9_0=vec3(1.0);
}
#endif
return l9_0;
}
vec3 evaluateSh(vec3 L00,vec3 L1_1,vec3 L10,vec3 L11,vec3 L2_2,vec3 L2_1,vec3 L20,vec3 L21,vec3 L22,vec3 n)
{
return ((((((L22*0.42904299)*((n.x*n.x)-(n.y*n.y)))+((L20*0.74312502)*(n.z*n.z)))+(L00*0.88622701))-(L20*0.24770799))+((((L2_2*(n.x*n.y))+(L21*(n.x*n.z)))+(L2_1*(n.y*n.z)))*0.85808599))+((((L11*n.x)+(L1_1*n.y))+(L10*n.z))*1.0233279);
}
vec4 sc_EnvmapSpecularSampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
return texture2D(sc_EnvmapSpecular,sc_SamplingCoordsViewToGlobal(uv,sc_EnvmapSpecularLayout,viewIndex).xy,bias);
}
int sc_EnvmapDiffuseGetStereoViewIndex()
{
int l9_0;
#if (sc_EnvmapDiffuseHasSwappedViews)
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
vec4 sc_EnvmapDiffuseSampleViewIndexBias(vec2 uv,int viewIndex,float bias)
{
return texture2D(sc_EnvmapDiffuse,sc_SamplingCoordsViewToGlobal(uv,sc_EnvmapDiffuseLayout,viewIndex).xy,bias);
}
vec3 sampleDiffuseEnvmap(vec3 N)
{
vec2 l9_0=calcPanoramicTexCoordsFromDir(N,sc_EnvmapRotation.y);
vec4 l9_1;
#if (sc_EnvLightMode==sc_AmbientLightMode_FromCamera)
{
vec2 l9_2;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_2=calcSeamlessPanoramicUvsForSampling(l9_0,sc_EnvmapSpecularSize.xy,5.0);
}
#else
{
l9_2=l9_0;
}
#endif
l9_1=sc_EnvmapSpecularSampleViewIndexBias(l9_2,sc_EnvmapSpecularGetStereoViewIndex(),13.0);
}
#else
{
vec4 l9_3;
#if ((sc_MaxTextureImageUnits>8)&&sc_HasDiffuseEnvmap)
{
l9_3=sc_EnvmapDiffuseSampleViewIndexBias(calcSeamlessPanoramicUvsForSampling(l9_0,sc_EnvmapDiffuseSize.xy,0.0),sc_EnvmapDiffuseGetStereoViewIndex(),-13.0);
}
#else
{
l9_3=sc_EnvmapSpecularSampleViewIndexBias(l9_0,sc_EnvmapSpecularGetStereoViewIndex(),13.0);
}
#endif
l9_1=l9_3;
}
#endif
return (l9_1.xyz*(1.0/l9_1.w))*sc_EnvmapExposure;
}
vec3 DiffuseTermSG(sc_SphericalGaussianLight_t lightingLobe,vec3 normal)
{
vec3 l9_0=lightingLobe.axis;
vec3 l9_1=normal;
float l9_2=dot(l9_0,l9_1);
float l9_3=lightingLobe.sharpness;
float l9_4=exp(-l9_3);
float l9_5=l9_4*l9_4;
float l9_6=1.0/l9_3;
float l9_7=(1.0+(2.0*l9_5))-l9_6;
float l9_8=sqrt(1.0-l9_7);
float l9_9=0.36000001*l9_2;
float l9_10=(1.0/(4.0*0.36000001))*l9_8;
float l9_11=l9_9+l9_10;
float l9_12;
if (step(abs(l9_9),l9_10)>0.5)
{
l9_12=(l9_11*l9_11)/l9_8;
}
else
{
l9_12=clamp(l9_2,0.0,1.0);
}
return (((lightingLobe.color/vec3(lightingLobe.sharpness))*6.2831855)*((l9_7*l9_12)+(((l9_4-l9_5)*l9_6)-l9_5)))/vec3(3.1415927);
}
vec3 calculateLightEstimationDiffuse(vec3 N)
{
vec3 l9_0;
l9_0=sc_LightEstimationData.ambientLight;
sc_SphericalGaussianLight_t param;
vec3 param_1;
int l9_1=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_1<sc_LightEstimationSGCount)
{
l9_0+=DiffuseTermSG(sc_LightEstimationData.sg[l9_1],N);
l9_1++;
continue;
}
else
{
break;
}
}
return l9_0;
}
vec3 calculateDiffuseIrradiance(vec3 N)
{
vec3 l9_0;
#if ((sc_EnvLightMode==sc_AmbientLightMode_EnvironmentMap)||(sc_EnvLightMode==sc_AmbientLightMode_FromCamera))
{
l9_0=sampleDiffuseEnvmap(N);
}
#else
{
vec3 l9_1;
#if (sc_EnvLightMode==sc_AmbientLightMode_SphericalHarmonics)
{
l9_1=evaluateSh(sc_Sh[0],sc_Sh[1],sc_Sh[2],sc_Sh[3],sc_Sh[4],sc_Sh[5],sc_Sh[6],sc_Sh[7],sc_Sh[8],-N)*sc_ShIntensity;
}
#else
{
l9_1=vec3(0.0);
}
#endif
l9_0=l9_1;
}
#endif
vec3 l9_2;
#if (sc_AmbientLightsCount>0)
{
vec3 l9_3;
#if (sc_AmbientLightMode0==sc_AmbientLightMode_Constant)
{
l9_3=l9_0+(sc_AmbientLights[0].color*sc_AmbientLights[0].intensity);
}
#else
{
vec3 l9_4=l9_0;
l9_4.x=l9_0.x+(1e-06*sc_AmbientLights[0].color.x);
l9_3=l9_4;
}
#endif
l9_2=l9_3;
}
#else
{
l9_2=l9_0;
}
#endif
vec3 l9_5;
#if (sc_AmbientLightsCount>1)
{
vec3 l9_6;
#if (sc_AmbientLightMode1==sc_AmbientLightMode_Constant)
{
l9_6=l9_2+(sc_AmbientLights[1].color*sc_AmbientLights[1].intensity);
}
#else
{
vec3 l9_7=l9_2;
l9_7.x=l9_2.x+(1e-06*sc_AmbientLights[1].color.x);
l9_6=l9_7;
}
#endif
l9_5=l9_6;
}
#else
{
l9_5=l9_2;
}
#endif
vec3 l9_8;
#if (sc_AmbientLightsCount>2)
{
vec3 l9_9;
#if (sc_AmbientLightMode2==sc_AmbientLightMode_Constant)
{
l9_9=l9_5+(sc_AmbientLights[2].color*sc_AmbientLights[2].intensity);
}
#else
{
vec3 l9_10=l9_5;
l9_10.x=l9_5.x+(1e-06*sc_AmbientLights[2].color.x);
l9_9=l9_10;
}
#endif
l9_8=l9_9;
}
#else
{
l9_8=l9_5;
}
#endif
vec3 l9_11;
#if (sc_LightEstimation)
{
l9_11=l9_8+calculateLightEstimationDiffuse(N);
}
#else
{
l9_11=l9_8;
}
#endif
return l9_11;
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
vec3 calculateIndirectSpecularEnvmap(SurfaceProperties surfaceProperties,vec3 V)
{
return ((sampleSpecularEnvTextureLod(getSpecularDominantDir(surfaceProperties.normal,reflect(-V,surfaceProperties.normal),surfaceProperties.roughness),clamp(pow(surfaceProperties.roughness,0.66666669),0.0,1.0)*5.0)*sc_EnvmapExposure)+vec3(1e-06))*envBRDFApprox(surfaceProperties,abs(dot(surfaceProperties.normal,V)));
}
sc_SphericalGaussianLight_t DistributionTermSG(vec3 direction,float roughness)
{
float l9_0=roughness*roughness;
return sc_SphericalGaussianLight_t(vec3(1.0/(3.1415927*l9_0)),2.0/l9_0,direction);
}
sc_SphericalGaussianLight_t WarpDistributionSG(sc_SphericalGaussianLight_t ndf,vec3 view)
{
return sc_SphericalGaussianLight_t(ndf.color,ndf.sharpness/(4.0*max(dot(ndf.axis,view),9.9999997e-05)),reflect(-view,ndf.axis));
}
vec3 SGInnerProduct(sc_SphericalGaussianLight_t lhs,sc_SphericalGaussianLight_t rhs)
{
float l9_0=length((lhs.axis*lhs.sharpness)+(rhs.axis*rhs.sharpness));
return ((((lhs.color*exp((l9_0-lhs.sharpness)-rhs.sharpness))*rhs.color)*6.2831855)*(1.0-exp((-2.0)*l9_0)))/vec3(l9_0);
}
vec3 SpecularTermSG(sc_SphericalGaussianLight_t light,vec3 normal,float roughness,vec3 view,vec3 specColor)
{
sc_SphericalGaussianLight_t l9_0=WarpDistributionSG(DistributionTermSG(normal,roughness),view);
vec3 l9_1=l9_0.axis;
float l9_2=roughness*roughness;
float l9_3=clamp(dot(normal,l9_1),0.0,1.0);
float l9_4=clamp(dot(normal,view),0.0,1.0);
float l9_5=1.0-l9_2;
return ((SGInnerProduct(l9_0,light)*((1.0/(l9_3+sqrt(l9_2+((l9_5*l9_3)*l9_3))))*(1.0/(l9_4+sqrt(l9_2+((l9_5*l9_4)*l9_4))))))*(specColor+((vec3(1.0)-specColor)*pow(1.0-clamp(dot(l9_1,normalize(l9_1+view)),0.0,1.0),5.0))))*l9_3;
}
vec3 calculateLightEstimationSpecular(SurfaceProperties surfaceProperties,vec3 V)
{
float l9_0=surfaceProperties.roughness;
float l9_1=surfaceProperties.roughness;
vec3 l9_2;
l9_2=sc_LightEstimationData.ambientLight*surfaceProperties.specColor;
sc_SphericalGaussianLight_t param;
vec3 param_1;
float param_2;
vec3 param_3;
vec3 param_4;
int l9_3=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_3<sc_LightEstimationSGCount)
{
l9_2+=SpecularTermSG(sc_LightEstimationData.sg[l9_3],surfaceProperties.normal,clamp(l9_0*l9_1,0.0099999998,1.0),V,surfaceProperties.specColor);
l9_3++;
continue;
}
else
{
break;
}
}
return l9_2;
}
vec3 calculateIndirectSpecular(SurfaceProperties surfaceProperties,vec3 V)
{
vec3 l9_0;
#if ((sc_EnvLightMode==sc_AmbientLightMode_EnvironmentMap)||(sc_EnvLightMode==sc_AmbientLightMode_FromCamera))
{
l9_0=vec3(0.0)+calculateIndirectSpecularEnvmap(surfaceProperties,V);
}
#else
{
l9_0=vec3(0.0);
}
#endif
vec3 l9_1;
#if (sc_LightEstimation)
{
l9_1=l9_0+calculateLightEstimationSpecular(surfaceProperties,V);
}
#else
{
l9_1=l9_0;
}
#endif
return l9_1;
}
LightingComponents evaluateLighting(SurfaceProperties surfaceProperties)
{
vec3 l9_0=surfaceProperties.viewDirWS;
vec4 bakedShadows=vec4(surfaceProperties.bakedShadows,1.0);
vec3 l9_1;
vec3 l9_2;
vec3 l9_3;
vec3 l9_4;
int l9_5;
vec3 l9_6;
vec3 l9_7;
#if (sc_DirectionalLightsCount>0)
{
vec3 l9_8;
vec3 l9_9;
vec3 l9_10;
vec3 l9_11;
int l9_12;
vec3 l9_13;
vec3 l9_14;
l9_14=vec3(1.0);
l9_13=vec3(0.0);
l9_12=0;
l9_11=vec3(0.0);
l9_10=vec3(0.0);
l9_9=vec3(0.0);
l9_8=vec3(0.0);
LightingComponents param;
LightProperties param_1;
SurfaceProperties param_2;
vec3 param_3;
int l9_15=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_15<sc_DirectionalLightsCount)
{
LightingComponents l9_16=accumulateLight(LightingComponents(l9_8,l9_9,l9_14,l9_13,l9_11,l9_10),LightProperties(sc_DirectionalLights[l9_15].direction,sc_DirectionalLights[l9_15].color.xyz,sc_DirectionalLights[l9_15].color.w*bakedShadows[(l9_12<3) ? l9_12 : 3]),surfaceProperties,l9_0);
l9_14=l9_16.indirectDiffuse;
l9_13=l9_16.indirectSpecular;
l9_12++;
l9_11=l9_16.emitted;
l9_10=l9_16.transmitted;
l9_9=l9_16.directSpecular;
l9_8=l9_16.directDiffuse;
l9_15++;
continue;
}
else
{
break;
}
}
l9_7=l9_14;
l9_6=l9_13;
l9_5=l9_12;
l9_4=l9_11;
l9_3=l9_10;
l9_2=l9_9;
l9_1=l9_8;
}
#else
{
l9_7=vec3(1.0);
l9_6=vec3(0.0);
l9_5=0;
l9_4=vec3(0.0);
l9_3=vec3(0.0);
l9_2=vec3(0.0);
l9_1=vec3(0.0);
}
#endif
vec3 l9_17;
vec3 l9_18;
vec3 l9_19;
vec3 l9_20;
#if (sc_PointLightsCount>0)
{
vec3 l9_21;
vec3 l9_22;
vec3 l9_23;
vec3 l9_24;
vec3 l9_25;
vec3 l9_26;
l9_26=l9_7;
l9_25=l9_6;
l9_24=l9_4;
l9_23=l9_3;
l9_22=l9_2;
l9_21=l9_1;
int l9_27;
vec3 l9_28;
vec3 l9_29;
vec3 l9_30;
vec3 l9_31;
vec3 l9_32;
vec3 l9_33;
int l9_34=0;
int l9_35=l9_5;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_34<sc_PointLightsCount)
{
vec3 l9_36=surfaceProperties.positionWS;
vec3 l9_37=sc_PointLights[l9_34].position-l9_36;
vec3 l9_38=normalize(l9_37);
float l9_39=bakedShadows[(l9_35<3) ? l9_35 : 3];
float l9_40=clamp((dot(l9_38,sc_PointLights[l9_34].direction)*sc_PointLights[l9_34].angleScale)+sc_PointLights[l9_34].angleOffset,0.0,1.0);
float l9_41=(sc_PointLights[l9_34].color.w*l9_39)*(l9_40*l9_40);
float l9_42;
if (sc_PointLights[l9_34].falloffEnabled)
{
l9_42=l9_41*computeDistanceAttenuation(length(l9_37),sc_PointLights[l9_34].falloffEndDistance);
}
else
{
l9_42=l9_41;
}
l9_27=l9_35+1;
LightingComponents l9_43=accumulateLight(LightingComponents(l9_21,l9_22,l9_26,l9_25,l9_24,l9_23),LightProperties(l9_38,sc_PointLights[l9_34].color.xyz,l9_42),surfaceProperties,l9_0);
l9_28=l9_43.directDiffuse;
l9_29=l9_43.directSpecular;
l9_30=l9_43.indirectDiffuse;
l9_31=l9_43.indirectSpecular;
l9_32=l9_43.emitted;
l9_33=l9_43.transmitted;
l9_26=l9_30;
l9_25=l9_31;
l9_35=l9_27;
l9_24=l9_32;
l9_23=l9_33;
l9_22=l9_29;
l9_21=l9_28;
l9_34++;
continue;
}
else
{
break;
}
}
l9_20=l9_24;
l9_19=l9_23;
l9_18=l9_22;
l9_17=l9_21;
}
#else
{
l9_20=l9_4;
l9_19=l9_3;
l9_18=l9_2;
l9_17=l9_1;
}
#endif
vec3 l9_44;
vec3 l9_45;
#if (sc_ProjectiveShadowsReceiver)
{
vec3 l9_46=evaluateShadow();
l9_45=l9_17*l9_46;
l9_44=l9_18*l9_46;
}
#else
{
l9_45=l9_17;
l9_44=l9_18;
}
#endif
return LightingComponents(l9_45,l9_44,calculateDiffuseIrradiance(surfaceProperties.normal),calculateIndirectSpecular(surfaceProperties,l9_0),l9_20,l9_19);
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
vec3 combineSurfacePropertiesWithLighting(SurfaceProperties surfaceProperties,LightingComponents lighting,bool enablePremultipliedAlpha)
{
vec3 l9_0=surfaceProperties.albedo;
vec3 l9_1=lighting.directDiffuse;
vec3 l9_2=lighting.indirectDiffuse;
vec3 l9_3=surfaceProperties.ao;
vec3 l9_4=l9_0*(l9_1+(l9_2*l9_3));
vec3 l9_5=lighting.directSpecular;
vec3 l9_6=lighting.indirectSpecular;
vec3 l9_7=surfaceProperties.specularAo;
vec3 l9_8=surfaceProperties.emissive;
vec3 l9_9=lighting.transmitted;
vec3 l9_10;
if (enablePremultipliedAlpha)
{
l9_10=l9_4*srgbToLinear(surfaceProperties.opacity);
}
else
{
l9_10=l9_4;
}
return ((l9_10+(l9_5+(l9_6*l9_7)))+l9_8)+l9_9;
}
vec3 linearToneMapping(vec3 x)
{
return (x*((x*1.8)+vec3(1.4)))/((x*((x*1.8)+vec3(0.5)))+vec3(1.5));
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
vec4 ngsCalculateLighting(vec3 albedo,float opacity,vec3 normal,vec3 position,vec3 viewDir,vec3 emissive,float metallic,float roughness,vec3 ao,vec3 specularAO)
{
SurfaceProperties l9_0=defaultSurfaceProperties();
vec3 l9_1=l9_0.bakedShadows;
float l9_2=opacity;
vec3 l9_3=ssSRGB_to_Linear(albedo);
vec3 l9_4=normal;
vec3 l9_5=normalize(l9_4);
vec3 l9_6=position;
vec3 l9_7=viewDir;
vec3 l9_8=ssSRGB_to_Linear(emissive);
float l9_9=metallic;
float l9_10=roughness;
vec3 l9_11=ao;
vec3 l9_12=specularAO;
vec3 l9_13;
#if (sc_SSAOEnabled)
{
l9_13=evaluateSSAO(l9_6);
}
#else
{
l9_13=l9_11;
}
#endif
vec3 l9_14;
vec3 l9_15;
deriveAlbedoAndSpecColorFromSurfaceProperties(SurfaceProperties(l9_3,l9_2,l9_5,l9_6,l9_7,l9_9,l9_10,l9_8,l9_13,l9_12,l9_1,l9_0.specColor),l9_14,l9_15);
vec3 l9_16=l9_14;
vec3 l9_17=l9_15;
LightingComponents l9_18=evaluateLighting(SurfaceProperties(l9_16,l9_2,l9_5,l9_6,l9_7,l9_9,l9_10,l9_8,l9_13,l9_12,l9_1,l9_17));
float l9_19;
vec3 l9_20;
vec3 l9_21;
vec3 l9_22;
#if (sc_BlendMode_ColoredGlass)
{
l9_22=vec3(0.0);
l9_21=vec3(0.0);
l9_20=ssSRGB_to_Linear(sc_GetFramebufferColor().xyz)*mix(vec3(1.0),l9_16,vec3(l9_2));
l9_19=1.0;
}
#else
{
l9_22=l9_18.directDiffuse;
l9_21=l9_18.indirectDiffuse;
l9_20=l9_18.transmitted;
l9_19=l9_2;
}
#endif
bool l9_23;
#if (sc_BlendMode_PremultipliedAlpha)
{
l9_23=true;
}
#else
{
l9_23=false;
}
#endif
vec3 l9_24=combineSurfacePropertiesWithLighting(SurfaceProperties(l9_16,l9_19,l9_5,l9_6,l9_7,l9_9,l9_10,l9_8,l9_13,l9_12,l9_1,l9_17),LightingComponents(l9_22,l9_18.directSpecular,l9_21,l9_18.indirectSpecular,l9_18.emitted,l9_20),l9_23);
float l9_25=l9_24.x;
vec4 l9_26=vec4(l9_25,l9_24.yz,l9_19);
vec4 l9_27;
#if (sc_IsEditor)
{
vec4 l9_28=l9_26;
l9_28.x=l9_25+((l9_13.x*l9_12.x)*9.9999997e-06);
l9_27=l9_28;
}
#else
{
l9_27=l9_26;
}
#endif
vec4 l9_29;
#if (!sc_BlendMode_Multiply)
{
vec3 l9_30=linearToneMapping(l9_27.xyz);
l9_29=vec4(l9_30.x,l9_30.y,l9_30.z,l9_27.w);
}
#else
{
l9_29=l9_27;
}
#endif
vec3 l9_31=vec3(linearToSrgb(l9_29.x),linearToSrgb(l9_29.y),linearToSrgb(l9_29.z));
return vec4(l9_31.x,l9_31.y,l9_31.z,l9_29.w);
}
void Node17_Conditional(float Input0,vec4 Input1,vec4 Input2,out vec4 Output,ssGlobals Globals)
{
#if (ENABLE_GLTF_LIGHTING)
{
float l9_0;
#if (ENABLE_NORMALMAP)
{
l9_0=normalTextureScale;
}
#else
{
l9_0=Port_Input2_N043;
}
#endif
float l9_1;
#if (ENABLE_METALLIC_ROUGHNESS_TEX)
{
l9_1=occlusionTextureStrength;
}
#else
{
l9_1=Port_Input2_N062;
}
#endif
float param;
Node40_Bool_Parameter(param,Globals);
float param_2;
Node121_Bool_Parameter(param_2,Globals);
float param_4;
Node48_Bool_Parameter(param_4,Globals);
float param_6;
Node88_Bool_Parameter(param_6,Globals);
vec3 param_17;
float param_18;
vec4 param_19;
Node35_Unlit(param,param_2,float(NODE_7_DROPLIST_ITEM),baseColorFactor,param_4,param_6,baseColorTexture_offset,baseColorTexture_scale,baseColorTexture_rotation,param_17,param_18,param_19,Globals);
tempGlobals=Globals;
N3_DebugSheenEnvLightMult=Port_DebugSheenEnvLightMult_N003;
N3_DebugSheenPunctualLightMult=Port_DebugSheenPunctualLightMult_N003;
N3_EmissiveColor=emissiveFactor;
N3_EnableEmissiveTexture=(int(ENABLE_EMISSIVE)!=0);
N3_EmissiveTextureCoord=NODE_10_DROPLIST_ITEM;
N3_EnableNormalTexture=(int(ENABLE_NORMALMAP)!=0);
N3_NormalScale=l9_0;
N3_NormalTextureCoord=NODE_8_DROPLIST_ITEM;
N3_MetallicValue=metallicFactor;
N3_RoughnessValue=roughnessFactor;
N3_EnableMetallicRoughnessTexture=(int(ENABLE_METALLIC_ROUGHNESS_TEX)!=0);
N3_OcclusionStrength=l9_1;
N3_MaterialParamsTextureCoord=NODE_11_DROPLIST_ITEM;
N3_TransmissionEnable=(int(ENABLE_TRANSMISSION)!=0);
N3_TransmissionFactor=transmissionFactor;
N3_EnableTransmissionTexture=(int(ENABLE_TRANSMISSION_TEX)!=0);
N3_TransmissionTextureCoord=Tweak_N30;
N3_SheenEnable=(int(ENABLE_SHEEN)!=0);
N3_SheenColorFactor=sheenColorFactor;
N3_EnableSheenTexture=(int(ENABLE_SHEEN_COLOR_TEX)!=0);
N3_SheenColorTextureCoord=Tweak_N32;
N3_SheenRoughnessFactor=sheenRoughnessFactor;
N3_EnableSheenRoughnessTexture=(int(ENABLE_SHEEN_ROUGHNESS_TEX)!=0);
N3_SheenRoughnessTextureCoord=Tweak_N37;
N3_ClearcoatEnable=(int(ENABLE_CLEARCOAT)!=0);
N3_ClearcoatFactor=clearcoatFactor;
N3_EnableClearcoatTexture=(int(ENABLE_CLEARCOAT_TEX)!=0);
N3_ClearcoatTextureCoord=Tweak_N44;
N3_ClearcoatRoughnessFactor=clearcoatRoughnessFactor;
N3_EnableClearCoatRoughnessTexture=(int(ENABLE_CLEARCOAT_ROUGHNESS_TEX)!=0);
N3_ClearcoatRoughnessTextureCoord=Tweak_N60;
N3_EnableClearCoatNormalTexture=(int(ENABLE_CLEARCOAT_NORMAL_TEX)!=0);
N3_ClearcoatNormalMapCoord=Tweak_N47;
N3_BaseColorIn=param_17;
N3_OpacityIn=param_18;
N3_EnableTextureTransform=(int(ENABLE_TEXTURE_TRANSFORM)!=0);
N3_EmissiveTextureTransform=(int(ENABLE_EMISSIVE_TEXTURE_TRANSFORM)!=0);
N3_EmissiveTextureOffset=emissiveTexture_offset;
N3_EmissiveTextureScale=emissiveTexture_scale;
N3_EmissiveTextureRotation=emissiveTexture_rotation;
N3_NormalTextureTransform=(int(ENABLE_NORMAL_TEXTURE_TRANSFORM)!=0);
N3_NormalTextureOffset=normalTexture_offset;
N3_NormalTextureScale=normalTexture_scale;
N3_NormalTextureRotation=normalTexture_rotation;
N3_MaterialParamsTextureTransform=(int(ENABLE_METALLIC_ROUGHNESS_TEXTURE_TRANSFORM)!=0);
N3_MaterialParamsTextureOffset=metallicRoughnessTexture_offset;
N3_MaterialParamsTextureScale=metallicRoughnessTexture_scale;
N3_MaterialParamsTextureRotation=metallicRoughnessTexture_rotation;
N3_TransmissionTextureTransform=(int(ENABLE_TRANSMISSION_TEXTURE_TRANSFORM)!=0);
N3_TransmissionTextureOffset=transmissionTexture_offset;
N3_TransmissionTextureScale=transmissionTexture_scale;
N3_TransmissionTextureRotation=transmissionTexture_rotation;
N3_SheenColorTextureTransform=(int(ENABLE_SHEEN_COLOR_TEXTURE_TRANSFORM)!=0);
N3_SheenColorTextureOffset=sheenColorTexture_offset;
N3_SheenColorTextureScale=sheenColorTexture_scale;
N3_SheenColorTextureRotation=sheenColorTexture_rotation;
N3_SheenRoughnessTextureTransform=(int(ENABLE_SHEEN_ROUGHNESS_TEXTURE_TRANSFORM)!=0);
N3_SheenRoughnessTextureOffset=sheenRoughnessTexture_offset;
N3_SheenRoughnessTextureScale=sheenRoughnessTexture_scale;
N3_SheenRoughnessTextureRotation=sheenRoughnessTexture_rotation;
N3_ClearcoatTextureTransform=(int(ENABLE_CLEARCOAT_TEXTURE_TRANSFORM)!=0);
N3_ClearcoatTextureOffset=clearcoatTexture_offset;
N3_ClearcoatTextureScale=clearcoatTexture_scale;
N3_ClearcoatTextureRotation=clearcoatTexture_rotation;
N3_ClearcoatNormalTextureTransform=(int(ENABLE_CLEARCOAT_NORMAL_TEXTURE_TRANSFORM)!=0);
N3_ClearcoatNormalTextureOffset=clearcoatNormalTexture_offset;
N3_ClearcoatNormalTextureScale=clearcoatNormalTexture_scale;
N3_ClearcoatNormalTextureRotation=clearcoatNormalTexture_rotation;
N3_ClearcoatRoughnessTextureTransform=(int(ENABLE_CLEARCOAT_ROUGHNESS_TEXTURE_TRANSFORM)!=0);
N3_ClearcoatRoughnessTextureOffset=clearcoatRoughnessTexture_offset;
N3_ClearcoatRoughnessTextureScale=clearcoatRoughnessTexture_scale;
N3_ClearcoatRoughnessTextureRotation=clearcoatRoughnessTexture_rotation;
N3_BaseColor=N3_BaseColorIn;
N3_Opacity=N3_OpacityIn;
N3_Emissive=N3_EmissiveColor;
if (N3_EnableEmissiveTexture)
{
vec3 l9_2=N3_Emissive;
vec2 l9_3=N3_getUV(N3_EmissiveTextureCoord);
vec2 l9_4;
if (N3_EnableTextureTransform&&N3_EmissiveTextureTransform)
{
l9_4=N3_uvTransform(l9_3,N3_EmissiveTextureOffset,N3_EmissiveTextureScale,N3_EmissiveTextureRotation);
}
else
{
l9_4=l9_3;
}
int l9_5;
#if (emissiveTextureHasSwappedViews)
{
l9_5=1-sc_GetStereoViewIndex();
}
#else
{
l9_5=sc_GetStereoViewIndex();
}
#endif
float l9_6=l9_4.x;
sc_SoftwareWrapEarly(l9_6,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTexture,SC_SOFTWARE_WRAP_MODE_V_emissiveTexture).x);
float l9_7=l9_6;
float l9_8=l9_4.y;
sc_SoftwareWrapEarly(l9_8,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTexture,SC_SOFTWARE_WRAP_MODE_V_emissiveTexture).y);
float l9_9=l9_8;
vec2 l9_10;
float l9_11;
#if (SC_USE_UV_MIN_MAX_emissiveTexture)
{
bool l9_12;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTexture)
{
l9_12=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTexture,SC_SOFTWARE_WRAP_MODE_V_emissiveTexture).x==3;
}
#else
{
l9_12=(int(SC_USE_CLAMP_TO_BORDER_emissiveTexture)!=0);
}
#endif
float l9_13=l9_7;
float l9_14=1.0;
sc_ClampUV(l9_13,emissiveTextureUvMinMax.x,emissiveTextureUvMinMax.z,l9_12,l9_14);
float l9_15=l9_13;
float l9_16=l9_14;
bool l9_17;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTexture)
{
l9_17=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTexture,SC_SOFTWARE_WRAP_MODE_V_emissiveTexture).y==3;
}
#else
{
l9_17=(int(SC_USE_CLAMP_TO_BORDER_emissiveTexture)!=0);
}
#endif
float l9_18=l9_9;
float l9_19=l9_16;
sc_ClampUV(l9_18,emissiveTextureUvMinMax.y,emissiveTextureUvMinMax.w,l9_17,l9_19);
l9_11=l9_19;
l9_10=vec2(l9_15,l9_18);
}
#else
{
l9_11=1.0;
l9_10=vec2(l9_7,l9_9);
}
#endif
vec2 l9_20=sc_TransformUV(l9_10,(int(SC_USE_UV_TRANSFORM_emissiveTexture)!=0),emissiveTextureTransform);
float l9_21=l9_20.x;
float l9_22=l9_11;
sc_SoftwareWrapLate(l9_21,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTexture,SC_SOFTWARE_WRAP_MODE_V_emissiveTexture).x,(int(SC_USE_CLAMP_TO_BORDER_emissiveTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTexture)!=0)),l9_22);
float l9_23=l9_20.y;
float l9_24=l9_22;
sc_SoftwareWrapLate(l9_23,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTexture,SC_SOFTWARE_WRAP_MODE_V_emissiveTexture).y,(int(SC_USE_CLAMP_TO_BORDER_emissiveTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTexture)!=0)),l9_24);
float l9_25=l9_24;
vec3 l9_26=sc_SamplingCoordsViewToGlobal(vec2(l9_21,l9_23),emissiveTextureLayout,l9_5);
vec4 l9_27=texture2D(emissiveTexture,l9_26.xy,0.0);
vec4 l9_28;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTexture)
{
l9_28=mix(emissiveTextureBorderColor,l9_27,vec4(l9_25));
}
#else
{
l9_28=l9_27;
}
#endif
N3_Emissive=ssSRGB_to_Linear(l9_28.xyz)*ssSRGB_to_Linear(l9_2);
}
N3_Normal=normalize(tempGlobals.VertexNormal_WorldSpace);
if (N3_EnableNormalTexture)
{
vec3 l9_29=N3_Normal;
vec2 l9_30=N3_getUV(N3_NormalTextureCoord);
vec2 l9_31;
if (N3_EnableTextureTransform&&N3_NormalTextureTransform)
{
l9_31=N3_uvTransform(l9_30,N3_NormalTextureOffset,N3_NormalTextureScale,N3_NormalTextureRotation);
}
else
{
l9_31=l9_30;
}
int l9_32;
#if (normalTextureHasSwappedViews)
{
l9_32=1-sc_GetStereoViewIndex();
}
#else
{
l9_32=sc_GetStereoViewIndex();
}
#endif
float l9_33=l9_31.x;
sc_SoftwareWrapEarly(l9_33,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTexture,SC_SOFTWARE_WRAP_MODE_V_normalTexture).x);
float l9_34=l9_33;
float l9_35=l9_31.y;
sc_SoftwareWrapEarly(l9_35,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTexture,SC_SOFTWARE_WRAP_MODE_V_normalTexture).y);
float l9_36=l9_35;
vec2 l9_37;
float l9_38;
#if (SC_USE_UV_MIN_MAX_normalTexture)
{
bool l9_39;
#if (SC_USE_CLAMP_TO_BORDER_normalTexture)
{
l9_39=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTexture,SC_SOFTWARE_WRAP_MODE_V_normalTexture).x==3;
}
#else
{
l9_39=(int(SC_USE_CLAMP_TO_BORDER_normalTexture)!=0);
}
#endif
float l9_40=l9_34;
float l9_41=1.0;
sc_ClampUV(l9_40,normalTextureUvMinMax.x,normalTextureUvMinMax.z,l9_39,l9_41);
float l9_42=l9_40;
float l9_43=l9_41;
bool l9_44;
#if (SC_USE_CLAMP_TO_BORDER_normalTexture)
{
l9_44=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTexture,SC_SOFTWARE_WRAP_MODE_V_normalTexture).y==3;
}
#else
{
l9_44=(int(SC_USE_CLAMP_TO_BORDER_normalTexture)!=0);
}
#endif
float l9_45=l9_36;
float l9_46=l9_43;
sc_ClampUV(l9_45,normalTextureUvMinMax.y,normalTextureUvMinMax.w,l9_44,l9_46);
l9_38=l9_46;
l9_37=vec2(l9_42,l9_45);
}
#else
{
l9_38=1.0;
l9_37=vec2(l9_34,l9_36);
}
#endif
vec2 l9_47=sc_TransformUV(l9_37,(int(SC_USE_UV_TRANSFORM_normalTexture)!=0),normalTextureTransform);
float l9_48=l9_47.x;
float l9_49=l9_38;
sc_SoftwareWrapLate(l9_48,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTexture,SC_SOFTWARE_WRAP_MODE_V_normalTexture).x,(int(SC_USE_CLAMP_TO_BORDER_normalTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTexture)!=0)),l9_49);
float l9_50=l9_47.y;
float l9_51=l9_49;
sc_SoftwareWrapLate(l9_50,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTexture,SC_SOFTWARE_WRAP_MODE_V_normalTexture).y,(int(SC_USE_CLAMP_TO_BORDER_normalTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTexture)!=0)),l9_51);
float l9_52=l9_51;
vec3 l9_53=sc_SamplingCoordsViewToGlobal(vec2(l9_48,l9_50),normalTextureLayout,l9_32);
vec4 l9_54=texture2D(normalTexture,l9_53.xy,0.0);
vec4 l9_55;
#if (SC_USE_CLAMP_TO_BORDER_normalTexture)
{
l9_55=mix(normalTextureBorderColor,l9_54,vec4(l9_52));
}
#else
{
l9_55=l9_54;
}
#endif
N3_Normal=normalize(mat3(tempGlobals.VertexTangent_WorldSpace,tempGlobals.VertexBinormal_WorldSpace,l9_29)*mix(vec3(0.0,0.0,1.0),(l9_55.xyz*1.9921875)-vec3(1.0),vec3(N3_NormalScale)));
}
N3_Metallic=N3_MetallicValue;
N3_Roughness=N3_RoughnessValue;
N3_Occlusion=vec4(1.0,1.0,1.0,0.0);
if (N3_EnableMetallicRoughnessTexture)
{
float l9_56=N3_Metallic;
float l9_57=N3_Roughness;
vec2 l9_58=N3_getUV(N3_MaterialParamsTextureCoord);
vec2 l9_59;
if (N3_EnableTextureTransform&&N3_MaterialParamsTextureTransform)
{
l9_59=N3_uvTransform(l9_58,N3_MaterialParamsTextureOffset,N3_MaterialParamsTextureScale,N3_MaterialParamsTextureRotation);
}
else
{
l9_59=l9_58;
}
int l9_60;
#if (metallicRoughnessTextureHasSwappedViews)
{
l9_60=1-sc_GetStereoViewIndex();
}
#else
{
l9_60=sc_GetStereoViewIndex();
}
#endif
float l9_61=l9_59.x;
sc_SoftwareWrapEarly(l9_61,ivec2(SC_SOFTWARE_WRAP_MODE_U_metallicRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_metallicRoughnessTexture).x);
float l9_62=l9_61;
float l9_63=l9_59.y;
sc_SoftwareWrapEarly(l9_63,ivec2(SC_SOFTWARE_WRAP_MODE_U_metallicRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_metallicRoughnessTexture).y);
float l9_64=l9_63;
vec2 l9_65;
float l9_66;
#if (SC_USE_UV_MIN_MAX_metallicRoughnessTexture)
{
bool l9_67;
#if (SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture)
{
l9_67=ivec2(SC_SOFTWARE_WRAP_MODE_U_metallicRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_metallicRoughnessTexture).x==3;
}
#else
{
l9_67=(int(SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture)!=0);
}
#endif
float l9_68=l9_62;
float l9_69=1.0;
sc_ClampUV(l9_68,metallicRoughnessTextureUvMinMax.x,metallicRoughnessTextureUvMinMax.z,l9_67,l9_69);
float l9_70=l9_68;
float l9_71=l9_69;
bool l9_72;
#if (SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture)
{
l9_72=ivec2(SC_SOFTWARE_WRAP_MODE_U_metallicRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_metallicRoughnessTexture).y==3;
}
#else
{
l9_72=(int(SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture)!=0);
}
#endif
float l9_73=l9_64;
float l9_74=l9_71;
sc_ClampUV(l9_73,metallicRoughnessTextureUvMinMax.y,metallicRoughnessTextureUvMinMax.w,l9_72,l9_74);
l9_66=l9_74;
l9_65=vec2(l9_70,l9_73);
}
#else
{
l9_66=1.0;
l9_65=vec2(l9_62,l9_64);
}
#endif
vec2 l9_75=sc_TransformUV(l9_65,(int(SC_USE_UV_TRANSFORM_metallicRoughnessTexture)!=0),metallicRoughnessTextureTransform);
float l9_76=l9_75.x;
float l9_77=l9_66;
sc_SoftwareWrapLate(l9_76,ivec2(SC_SOFTWARE_WRAP_MODE_U_metallicRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_metallicRoughnessTexture).x,(int(SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_metallicRoughnessTexture)!=0)),l9_77);
float l9_78=l9_75.y;
float l9_79=l9_77;
sc_SoftwareWrapLate(l9_78,ivec2(SC_SOFTWARE_WRAP_MODE_U_metallicRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_metallicRoughnessTexture).y,(int(SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_metallicRoughnessTexture)!=0)),l9_79);
float l9_80=l9_79;
vec3 l9_81=sc_SamplingCoordsViewToGlobal(vec2(l9_76,l9_78),metallicRoughnessTextureLayout,l9_60);
vec4 l9_82=texture2D(metallicRoughnessTexture,l9_81.xy,0.0);
vec4 l9_83;
#if (SC_USE_CLAMP_TO_BORDER_metallicRoughnessTexture)
{
l9_83=mix(metallicRoughnessTextureBorderColor,l9_82,vec4(l9_80));
}
#else
{
l9_83=l9_82;
}
#endif
vec4 l9_84=vec4(0.0);
l9_84.w=N3_OcclusionStrength;
vec3 l9_85=vec3(1.0+(N3_OcclusionStrength*(l9_83.z-1.0)));
N3_Metallic=l9_56*l9_83.x;
N3_Roughness=l9_57*l9_83.y;
N3_Occlusion=vec4(l9_85.x,l9_85.y,l9_85.z,l9_84.w);
}
if (N3_TransmissionEnable)
{
vec3 l9_86=N3_BaseColor;
vec3 l9_87=N3_Emissive;
float l9_88=N3_Metallic;
vec2 l9_89=tempGlobals.gScreenCoord;
int l9_90;
#if (screenTextureHasSwappedViews)
{
l9_90=1-sc_GetStereoViewIndex();
}
#else
{
l9_90=sc_GetStereoViewIndex();
}
#endif
float l9_91=l9_89.x;
sc_SoftwareWrapEarly(l9_91,ivec2(SC_SOFTWARE_WRAP_MODE_U_screenTexture,SC_SOFTWARE_WRAP_MODE_V_screenTexture).x);
float l9_92=l9_91;
float l9_93=l9_89.y;
sc_SoftwareWrapEarly(l9_93,ivec2(SC_SOFTWARE_WRAP_MODE_U_screenTexture,SC_SOFTWARE_WRAP_MODE_V_screenTexture).y);
float l9_94=l9_93;
vec2 l9_95;
float l9_96;
#if (SC_USE_UV_MIN_MAX_screenTexture)
{
bool l9_97;
#if (SC_USE_CLAMP_TO_BORDER_screenTexture)
{
l9_97=ivec2(SC_SOFTWARE_WRAP_MODE_U_screenTexture,SC_SOFTWARE_WRAP_MODE_V_screenTexture).x==3;
}
#else
{
l9_97=(int(SC_USE_CLAMP_TO_BORDER_screenTexture)!=0);
}
#endif
float l9_98=l9_92;
float l9_99=1.0;
sc_ClampUV(l9_98,screenTextureUvMinMax.x,screenTextureUvMinMax.z,l9_97,l9_99);
float l9_100=l9_98;
float l9_101=l9_99;
bool l9_102;
#if (SC_USE_CLAMP_TO_BORDER_screenTexture)
{
l9_102=ivec2(SC_SOFTWARE_WRAP_MODE_U_screenTexture,SC_SOFTWARE_WRAP_MODE_V_screenTexture).y==3;
}
#else
{
l9_102=(int(SC_USE_CLAMP_TO_BORDER_screenTexture)!=0);
}
#endif
float l9_103=l9_94;
float l9_104=l9_101;
sc_ClampUV(l9_103,screenTextureUvMinMax.y,screenTextureUvMinMax.w,l9_102,l9_104);
l9_96=l9_104;
l9_95=vec2(l9_100,l9_103);
}
#else
{
l9_96=1.0;
l9_95=vec2(l9_92,l9_94);
}
#endif
vec2 l9_105=sc_TransformUV(l9_95,(int(SC_USE_UV_TRANSFORM_screenTexture)!=0),screenTextureTransform);
float l9_106=l9_105.x;
float l9_107=l9_96;
sc_SoftwareWrapLate(l9_106,ivec2(SC_SOFTWARE_WRAP_MODE_U_screenTexture,SC_SOFTWARE_WRAP_MODE_V_screenTexture).x,(int(SC_USE_CLAMP_TO_BORDER_screenTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_screenTexture)!=0)),l9_107);
float l9_108=l9_105.y;
float l9_109=l9_107;
sc_SoftwareWrapLate(l9_108,ivec2(SC_SOFTWARE_WRAP_MODE_U_screenTexture,SC_SOFTWARE_WRAP_MODE_V_screenTexture).y,(int(SC_USE_CLAMP_TO_BORDER_screenTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_screenTexture)!=0)),l9_109);
float l9_110=l9_109;
vec3 l9_111=sc_SamplingCoordsViewToGlobal(vec2(l9_106,l9_108),screenTextureLayout,l9_90);
vec4 l9_112=texture2D(screenTexture,l9_111.xy,0.0);
vec4 l9_113;
#if (SC_USE_CLAMP_TO_BORDER_screenTexture)
{
l9_113=mix(screenTextureBorderColor,l9_112,vec4(l9_110));
}
#else
{
l9_113=l9_112;
}
#endif
N3_Background=ssSRGB_to_Linear(l9_113.xyz);
float l9_114;
if (N3_EnableTransmissionTexture)
{
vec2 l9_115=N3_getUV(N3_TransmissionTextureCoord);
vec2 l9_116;
if (N3_EnableTextureTransform&&N3_TransmissionTextureTransform)
{
l9_116=N3_uvTransform(l9_115,N3_TransmissionTextureOffset,N3_TransmissionTextureScale,N3_TransmissionTextureRotation);
}
else
{
l9_116=l9_115;
}
int l9_117;
#if (transmissionTextureHasSwappedViews)
{
l9_117=1-sc_GetStereoViewIndex();
}
#else
{
l9_117=sc_GetStereoViewIndex();
}
#endif
float l9_118=l9_116.x;
sc_SoftwareWrapEarly(l9_118,ivec2(SC_SOFTWARE_WRAP_MODE_U_transmissionTexture,SC_SOFTWARE_WRAP_MODE_V_transmissionTexture).x);
float l9_119=l9_118;
float l9_120=l9_116.y;
sc_SoftwareWrapEarly(l9_120,ivec2(SC_SOFTWARE_WRAP_MODE_U_transmissionTexture,SC_SOFTWARE_WRAP_MODE_V_transmissionTexture).y);
float l9_121=l9_120;
vec2 l9_122;
float l9_123;
#if (SC_USE_UV_MIN_MAX_transmissionTexture)
{
bool l9_124;
#if (SC_USE_CLAMP_TO_BORDER_transmissionTexture)
{
l9_124=ivec2(SC_SOFTWARE_WRAP_MODE_U_transmissionTexture,SC_SOFTWARE_WRAP_MODE_V_transmissionTexture).x==3;
}
#else
{
l9_124=(int(SC_USE_CLAMP_TO_BORDER_transmissionTexture)!=0);
}
#endif
float l9_125=l9_119;
float l9_126=1.0;
sc_ClampUV(l9_125,transmissionTextureUvMinMax.x,transmissionTextureUvMinMax.z,l9_124,l9_126);
float l9_127=l9_125;
float l9_128=l9_126;
bool l9_129;
#if (SC_USE_CLAMP_TO_BORDER_transmissionTexture)
{
l9_129=ivec2(SC_SOFTWARE_WRAP_MODE_U_transmissionTexture,SC_SOFTWARE_WRAP_MODE_V_transmissionTexture).y==3;
}
#else
{
l9_129=(int(SC_USE_CLAMP_TO_BORDER_transmissionTexture)!=0);
}
#endif
float l9_130=l9_121;
float l9_131=l9_128;
sc_ClampUV(l9_130,transmissionTextureUvMinMax.y,transmissionTextureUvMinMax.w,l9_129,l9_131);
l9_123=l9_131;
l9_122=vec2(l9_127,l9_130);
}
#else
{
l9_123=1.0;
l9_122=vec2(l9_119,l9_121);
}
#endif
vec2 l9_132=sc_TransformUV(l9_122,(int(SC_USE_UV_TRANSFORM_transmissionTexture)!=0),transmissionTextureTransform);
float l9_133=l9_132.x;
float l9_134=l9_123;
sc_SoftwareWrapLate(l9_133,ivec2(SC_SOFTWARE_WRAP_MODE_U_transmissionTexture,SC_SOFTWARE_WRAP_MODE_V_transmissionTexture).x,(int(SC_USE_CLAMP_TO_BORDER_transmissionTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_transmissionTexture)!=0)),l9_134);
float l9_135=l9_132.y;
float l9_136=l9_134;
sc_SoftwareWrapLate(l9_135,ivec2(SC_SOFTWARE_WRAP_MODE_U_transmissionTexture,SC_SOFTWARE_WRAP_MODE_V_transmissionTexture).y,(int(SC_USE_CLAMP_TO_BORDER_transmissionTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_transmissionTexture)!=0)),l9_136);
float l9_137=l9_136;
vec3 l9_138=sc_SamplingCoordsViewToGlobal(vec2(l9_133,l9_135),transmissionTextureLayout,l9_117);
vec4 l9_139=texture2D(transmissionTexture,l9_138.xy,0.0);
vec4 l9_140;
#if (SC_USE_CLAMP_TO_BORDER_transmissionTexture)
{
l9_140=mix(transmissionTextureBorderColor,l9_139,vec4(l9_137));
}
#else
{
l9_140=l9_139;
}
#endif
l9_114=l9_140.x;
}
else
{
l9_114=1.0;
}
vec3 l9_141=vec3(l9_114*N3_TransmissionFactor);
vec3 l9_142=vec3(l9_88);
N3_BaseColor=mix(mix(l9_86,vec3(0.0),l9_141),l9_86,l9_142);
N3_Emissive=mix(mix(vec3(0.0),l9_86,l9_141)*N3_Background,vec3(0.0),l9_142)+l9_87;
}
N3_BaseColor=ssLinear_to_SRGB(N3_BaseColor);
float l9_143=N3_Opacity;
float l9_144;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_144=pow(l9_143,0.45454544);
}
#else
{
l9_144=sqrt(l9_143);
}
#endif
N3_Opacity=l9_144;
N3_Emissive=ssLinear_to_SRGB(N3_Emissive);
if (N3_SheenEnable)
{
vec3 l9_145=N3_Normal;
vec4 l9_146=N3_Occlusion;
vec3 l9_147=N3_SheenColorFactor;
float l9_148=N3_SheenRoughnessFactor;
vec3 l9_149;
if (N3_EnableSheenTexture)
{
vec2 l9_150=N3_getUV(N3_SheenColorTextureCoord);
vec2 l9_151;
if (N3_EnableTextureTransform&&N3_SheenColorTextureTransform)
{
l9_151=N3_uvTransform(l9_150,N3_SheenColorTextureOffset,N3_SheenColorTextureScale,N3_SheenColorTextureRotation);
}
else
{
l9_151=l9_150;
}
int l9_152;
#if (sheenColorTextureHasSwappedViews)
{
l9_152=1-sc_GetStereoViewIndex();
}
#else
{
l9_152=sc_GetStereoViewIndex();
}
#endif
float l9_153=l9_151.x;
sc_SoftwareWrapEarly(l9_153,ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenColorTexture,SC_SOFTWARE_WRAP_MODE_V_sheenColorTexture).x);
float l9_154=l9_153;
float l9_155=l9_151.y;
sc_SoftwareWrapEarly(l9_155,ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenColorTexture,SC_SOFTWARE_WRAP_MODE_V_sheenColorTexture).y);
float l9_156=l9_155;
vec2 l9_157;
float l9_158;
#if (SC_USE_UV_MIN_MAX_sheenColorTexture)
{
bool l9_159;
#if (SC_USE_CLAMP_TO_BORDER_sheenColorTexture)
{
l9_159=ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenColorTexture,SC_SOFTWARE_WRAP_MODE_V_sheenColorTexture).x==3;
}
#else
{
l9_159=(int(SC_USE_CLAMP_TO_BORDER_sheenColorTexture)!=0);
}
#endif
float l9_160=l9_154;
float l9_161=1.0;
sc_ClampUV(l9_160,sheenColorTextureUvMinMax.x,sheenColorTextureUvMinMax.z,l9_159,l9_161);
float l9_162=l9_160;
float l9_163=l9_161;
bool l9_164;
#if (SC_USE_CLAMP_TO_BORDER_sheenColorTexture)
{
l9_164=ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenColorTexture,SC_SOFTWARE_WRAP_MODE_V_sheenColorTexture).y==3;
}
#else
{
l9_164=(int(SC_USE_CLAMP_TO_BORDER_sheenColorTexture)!=0);
}
#endif
float l9_165=l9_156;
float l9_166=l9_163;
sc_ClampUV(l9_165,sheenColorTextureUvMinMax.y,sheenColorTextureUvMinMax.w,l9_164,l9_166);
l9_158=l9_166;
l9_157=vec2(l9_162,l9_165);
}
#else
{
l9_158=1.0;
l9_157=vec2(l9_154,l9_156);
}
#endif
vec2 l9_167=sc_TransformUV(l9_157,(int(SC_USE_UV_TRANSFORM_sheenColorTexture)!=0),sheenColorTextureTransform);
float l9_168=l9_167.x;
float l9_169=l9_158;
sc_SoftwareWrapLate(l9_168,ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenColorTexture,SC_SOFTWARE_WRAP_MODE_V_sheenColorTexture).x,(int(SC_USE_CLAMP_TO_BORDER_sheenColorTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_sheenColorTexture)!=0)),l9_169);
float l9_170=l9_167.y;
float l9_171=l9_169;
sc_SoftwareWrapLate(l9_170,ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenColorTexture,SC_SOFTWARE_WRAP_MODE_V_sheenColorTexture).y,(int(SC_USE_CLAMP_TO_BORDER_sheenColorTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_sheenColorTexture)!=0)),l9_171);
float l9_172=l9_171;
vec3 l9_173=sc_SamplingCoordsViewToGlobal(vec2(l9_168,l9_170),sheenColorTextureLayout,l9_152);
vec4 l9_174=texture2D(sheenColorTexture,l9_173.xy,0.0);
vec4 l9_175;
#if (SC_USE_CLAMP_TO_BORDER_sheenColorTexture)
{
l9_175=mix(sheenColorTextureBorderColor,l9_174,vec4(l9_172));
}
#else
{
l9_175=l9_174;
}
#endif
l9_149=l9_147*ssSRGB_to_Linear(l9_175.xyz);
}
else
{
l9_149=l9_147;
}
float l9_176;
if (N3_EnableSheenRoughnessTexture)
{
vec2 l9_177=N3_getUV(N3_SheenRoughnessTextureCoord);
vec2 l9_178;
if (N3_EnableTextureTransform&&N3_SheenRoughnessTextureTransform)
{
l9_178=N3_uvTransform(l9_177,N3_SheenRoughnessTextureOffset,N3_SheenRoughnessTextureScale,N3_SheenRoughnessTextureRotation);
}
else
{
l9_178=l9_177;
}
int l9_179;
#if (sheenRoughnessTextureHasSwappedViews)
{
l9_179=1-sc_GetStereoViewIndex();
}
#else
{
l9_179=sc_GetStereoViewIndex();
}
#endif
float l9_180=l9_178.x;
sc_SoftwareWrapEarly(l9_180,ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_sheenRoughnessTexture).x);
float l9_181=l9_180;
float l9_182=l9_178.y;
sc_SoftwareWrapEarly(l9_182,ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_sheenRoughnessTexture).y);
float l9_183=l9_182;
vec2 l9_184;
float l9_185;
#if (SC_USE_UV_MIN_MAX_sheenRoughnessTexture)
{
bool l9_186;
#if (SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture)
{
l9_186=ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_sheenRoughnessTexture).x==3;
}
#else
{
l9_186=(int(SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture)!=0);
}
#endif
float l9_187=l9_181;
float l9_188=1.0;
sc_ClampUV(l9_187,sheenRoughnessTextureUvMinMax.x,sheenRoughnessTextureUvMinMax.z,l9_186,l9_188);
float l9_189=l9_187;
float l9_190=l9_188;
bool l9_191;
#if (SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture)
{
l9_191=ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_sheenRoughnessTexture).y==3;
}
#else
{
l9_191=(int(SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture)!=0);
}
#endif
float l9_192=l9_183;
float l9_193=l9_190;
sc_ClampUV(l9_192,sheenRoughnessTextureUvMinMax.y,sheenRoughnessTextureUvMinMax.w,l9_191,l9_193);
l9_185=l9_193;
l9_184=vec2(l9_189,l9_192);
}
#else
{
l9_185=1.0;
l9_184=vec2(l9_181,l9_183);
}
#endif
vec2 l9_194=sc_TransformUV(l9_184,(int(SC_USE_UV_TRANSFORM_sheenRoughnessTexture)!=0),sheenRoughnessTextureTransform);
float l9_195=l9_194.x;
float l9_196=l9_185;
sc_SoftwareWrapLate(l9_195,ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_sheenRoughnessTexture).x,(int(SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_sheenRoughnessTexture)!=0)),l9_196);
float l9_197=l9_194.y;
float l9_198=l9_196;
sc_SoftwareWrapLate(l9_197,ivec2(SC_SOFTWARE_WRAP_MODE_U_sheenRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_sheenRoughnessTexture).y,(int(SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_sheenRoughnessTexture)!=0)),l9_198);
float l9_199=l9_198;
vec3 l9_200=sc_SamplingCoordsViewToGlobal(vec2(l9_195,l9_197),sheenRoughnessTextureLayout,l9_179);
vec4 l9_201=texture2D(sheenRoughnessTexture,l9_200.xy,0.0);
vec4 l9_202;
#if (SC_USE_CLAMP_TO_BORDER_sheenRoughnessTexture)
{
l9_202=mix(sheenRoughnessTextureBorderColor,l9_201,vec4(l9_199));
}
#else
{
l9_202=l9_201;
}
#endif
l9_176=l9_148*ssSRGB_to_Linear(l9_202.w);
}
else
{
l9_176=l9_148;
}
float l9_203=max(l9_176,9.9999997e-05);
N3_SheenOut=vec4(0.0);
vec3 l9_204=tempGlobals.SurfacePosition_WorldSpace;
vec3 l9_205=normalize(sc_Camera.position-l9_204);
float l9_206=max(clamp(dot(l9_145,l9_205),0.0,1.0),9.9999997e-05);
float l9_207=l9_203*l9_203;
bool l9_208=l9_203<0.25;
float l9_209;
if (l9_208)
{
l9_209=(((-339.20001)*l9_207)+(161.39999*l9_203))-25.9;
}
else
{
l9_209=(((-8.4799995)*l9_207)+(14.3*l9_203))-9.9499998;
}
float l9_210;
if (l9_208)
{
l9_210=((44.0*l9_207)-(23.700001*l9_203))+3.26;
}
else
{
l9_210=((1.97*l9_207)-(3.27*l9_203))+0.72000003;
}
float l9_211=l9_209*l9_206;
float l9_212=l9_211+l9_210;
float l9_213;
if (l9_208)
{
l9_213=0.0;
}
else
{
l9_213=0.1*(l9_203-0.25);
}
vec3 l9_214=N3_SheenOut.xyz+((((sampleSpecularEnvTextureLod(normalize(reflect(-l9_205,l9_145)),3.0+((((l9_203*4.0)-0.0)*2.0)/5.0))*sc_EnvmapExposure)+vec3(1e-06))*l9_149)*clamp((exp(l9_212)+l9_213)*3.1415927,0.0,1.0));
N3_SheenOut=vec4(l9_214.x,l9_214.y,l9_214.z,N3_SheenOut.w);
vec3 l9_215=mix(N3_SheenOut.xyz,N3_SheenOut.xyz*l9_146.xyz,vec3(l9_146.w));
N3_SheenOut=vec4(l9_215.x,l9_215.y,l9_215.z,N3_SheenOut.w);
vec3 l9_216;
#if (sc_DirectionalLightsCount>0)
{
vec3 l9_217;
l9_217=vec3(0.0);
vec3 l9_218;
int l9_219=0;
bool l9_220;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
l9_220=l9_219<sc_DirectionalLightsCount;
if (l9_220)
{
vec3 l9_221;
if (l9_220)
{
l9_221=sc_DirectionalLights[l9_219].color.xyz;
}
else
{
l9_221=vec3(0.0);
}
float l9_222;
if (l9_220)
{
l9_222=sc_DirectionalLights[l9_219].color.w;
}
else
{
l9_222=0.0;
}
vec3 l9_223=l9_221*l9_222;
vec3 l9_224;
if (l9_220)
{
l9_224=-sc_DirectionalLights[l9_219].direction;
}
else
{
l9_224=vec3(0.0);
}
vec3 l9_225=normalize(-l9_224);
float l9_226=clamp(dot(l9_145,l9_225),0.0,1.0);
l9_218=l9_217+(((((l9_223*3.1415901)*l9_149)*N3_charlieD(l9_207,clamp(dot(l9_145,normalize(l9_225+l9_205)),0.0,1.0)))*(1.0/(4.0*((l9_226+l9_206)-(l9_226*l9_206)))))*l9_226);
l9_217=l9_218;
l9_219++;
continue;
}
else
{
break;
}
}
l9_216=l9_217;
}
#else
{
l9_216=vec3(0.0);
}
#endif
vec3 l9_227;
#if (sc_PointLightsCount>0)
{
vec3 l9_228;
l9_228=l9_216;
vec3 l9_229;
int l9_230=0;
bool l9_231;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
l9_231=l9_230<sc_PointLightsCount;
if (l9_231)
{
vec3 l9_232;
if (l9_231)
{
l9_232=sc_PointLights[l9_230].color.xyz;
}
else
{
l9_232=vec3(0.0);
}
float l9_233;
if (l9_231)
{
l9_233=sc_PointLights[l9_230].color.w;
}
else
{
l9_233=0.0;
}
vec3 l9_234=l9_232*l9_233;
vec3 l9_235;
if (l9_231)
{
l9_235=sc_PointLights[l9_230].position;
}
else
{
l9_235=vec3(0.0);
}
vec3 l9_236=normalize(l9_235-tempGlobals.SurfacePosition_WorldSpace);
float l9_237=clamp(dot(l9_145,l9_236),0.0,1.0);
l9_229=l9_228+(((((l9_234*3.1415901)*l9_149)*N3_charlieD(l9_207,clamp(dot(l9_145,normalize(l9_236+l9_205)),0.0,1.0)))*(1.0/(4.0*((l9_237+l9_206)-(l9_237*l9_206)))))*l9_237);
l9_228=l9_229;
l9_230++;
continue;
}
else
{
break;
}
}
l9_227=l9_228;
}
#else
{
l9_227=l9_216;
}
#endif
vec3 l9_238;
#if (sc_AmbientLightsCount>0)
{
vec3 l9_239;
l9_239=l9_227;
vec3 l9_240;
int l9_241=0;
bool l9_242;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
l9_242=l9_241<sc_AmbientLightsCount;
if (l9_242)
{
vec3 l9_243;
if (l9_242)
{
l9_243=sc_AmbientLights[l9_241].color;
}
else
{
l9_243=vec3(0.0);
}
float l9_244;
if (l9_242)
{
l9_244=sc_AmbientLights[l9_241].intensity;
}
else
{
l9_244=0.0;
}
l9_240=l9_239+(((l9_243*l9_244)/vec3(3.1415901))*l9_149);
l9_239=l9_240;
l9_241++;
continue;
}
else
{
break;
}
}
l9_238=l9_239;
}
#else
{
l9_238=l9_227;
}
#endif
vec3 l9_245=N3_SheenOut.xyz+l9_238;
N3_SheenOut=vec4(l9_245.x,l9_245.y,l9_245.z,N3_SheenOut.w);
N3_SheenOut.w=1.0-(max(max(l9_149.x,l9_149.y),l9_149.z)*0.15700001);
}
if (N3_ClearcoatEnable)
{
N3_ClearcoatBase=1.0;
N3_ClearcoatRoughness=1.0;
N3_ClearcoatNormal=vec3(0.0,0.0,1.0);
if (N3_EnableClearcoatTexture)
{
vec2 l9_246=N3_getUV(N3_ClearcoatTextureCoord);
vec2 l9_247;
if (N3_EnableTextureTransform&&N3_ClearcoatTextureTransform)
{
l9_247=N3_uvTransform(l9_246,N3_ClearcoatTextureOffset,N3_ClearcoatTextureScale,N3_ClearcoatTextureRotation);
}
else
{
l9_247=l9_246;
}
int l9_248;
#if (clearcoatTextureHasSwappedViews)
{
l9_248=1-sc_GetStereoViewIndex();
}
#else
{
l9_248=sc_GetStereoViewIndex();
}
#endif
float l9_249=l9_247.x;
sc_SoftwareWrapEarly(l9_249,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatTexture).x);
float l9_250=l9_249;
float l9_251=l9_247.y;
sc_SoftwareWrapEarly(l9_251,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatTexture).y);
float l9_252=l9_251;
vec2 l9_253;
float l9_254;
#if (SC_USE_UV_MIN_MAX_clearcoatTexture)
{
bool l9_255;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatTexture)
{
l9_255=ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatTexture).x==3;
}
#else
{
l9_255=(int(SC_USE_CLAMP_TO_BORDER_clearcoatTexture)!=0);
}
#endif
float l9_256=l9_250;
float l9_257=1.0;
sc_ClampUV(l9_256,clearcoatTextureUvMinMax.x,clearcoatTextureUvMinMax.z,l9_255,l9_257);
float l9_258=l9_256;
float l9_259=l9_257;
bool l9_260;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatTexture)
{
l9_260=ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatTexture).y==3;
}
#else
{
l9_260=(int(SC_USE_CLAMP_TO_BORDER_clearcoatTexture)!=0);
}
#endif
float l9_261=l9_252;
float l9_262=l9_259;
sc_ClampUV(l9_261,clearcoatTextureUvMinMax.y,clearcoatTextureUvMinMax.w,l9_260,l9_262);
l9_254=l9_262;
l9_253=vec2(l9_258,l9_261);
}
#else
{
l9_254=1.0;
l9_253=vec2(l9_250,l9_252);
}
#endif
vec2 l9_263=sc_TransformUV(l9_253,(int(SC_USE_UV_TRANSFORM_clearcoatTexture)!=0),clearcoatTextureTransform);
float l9_264=l9_263.x;
float l9_265=l9_254;
sc_SoftwareWrapLate(l9_264,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatTexture).x,(int(SC_USE_CLAMP_TO_BORDER_clearcoatTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_clearcoatTexture)!=0)),l9_265);
float l9_266=l9_263.y;
float l9_267=l9_265;
sc_SoftwareWrapLate(l9_266,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatTexture).y,(int(SC_USE_CLAMP_TO_BORDER_clearcoatTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_clearcoatTexture)!=0)),l9_267);
float l9_268=l9_267;
vec3 l9_269=sc_SamplingCoordsViewToGlobal(vec2(l9_264,l9_266),clearcoatTextureLayout,l9_248);
vec4 l9_270=texture2D(clearcoatTexture,l9_269.xy,0.0);
vec4 l9_271;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatTexture)
{
l9_271=mix(clearcoatTextureBorderColor,l9_270,vec4(l9_268));
}
#else
{
l9_271=l9_270;
}
#endif
N3_ClearcoatBase=ssSRGB_to_Linear(l9_271.x);
}
N3_ClearcoatBase*=N3_ClearcoatFactor;
if (N3_EnableClearCoatRoughnessTexture)
{
vec2 l9_272=N3_getUV(N3_ClearcoatRoughnessTextureCoord);
vec2 l9_273;
if (N3_EnableTextureTransform&&N3_ClearcoatRoughnessTextureTransform)
{
l9_273=N3_uvTransform(l9_272,N3_ClearcoatRoughnessTextureOffset,N3_ClearcoatRoughnessTextureScale,N3_ClearcoatRoughnessTextureRotation);
}
else
{
l9_273=l9_272;
}
int l9_274;
#if (clearcoatRoughnessTextureHasSwappedViews)
{
l9_274=1-sc_GetStereoViewIndex();
}
#else
{
l9_274=sc_GetStereoViewIndex();
}
#endif
float l9_275=l9_273.x;
sc_SoftwareWrapEarly(l9_275,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatRoughnessTexture).x);
float l9_276=l9_275;
float l9_277=l9_273.y;
sc_SoftwareWrapEarly(l9_277,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatRoughnessTexture).y);
float l9_278=l9_277;
vec2 l9_279;
float l9_280;
#if (SC_USE_UV_MIN_MAX_clearcoatRoughnessTexture)
{
bool l9_281;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture)
{
l9_281=ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatRoughnessTexture).x==3;
}
#else
{
l9_281=(int(SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture)!=0);
}
#endif
float l9_282=l9_276;
float l9_283=1.0;
sc_ClampUV(l9_282,clearcoatRoughnessTextureUvMinMax.x,clearcoatRoughnessTextureUvMinMax.z,l9_281,l9_283);
float l9_284=l9_282;
float l9_285=l9_283;
bool l9_286;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture)
{
l9_286=ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatRoughnessTexture).y==3;
}
#else
{
l9_286=(int(SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture)!=0);
}
#endif
float l9_287=l9_278;
float l9_288=l9_285;
sc_ClampUV(l9_287,clearcoatRoughnessTextureUvMinMax.y,clearcoatRoughnessTextureUvMinMax.w,l9_286,l9_288);
l9_280=l9_288;
l9_279=vec2(l9_284,l9_287);
}
#else
{
l9_280=1.0;
l9_279=vec2(l9_276,l9_278);
}
#endif
vec2 l9_289=sc_TransformUV(l9_279,(int(SC_USE_UV_TRANSFORM_clearcoatRoughnessTexture)!=0),clearcoatRoughnessTextureTransform);
float l9_290=l9_289.x;
float l9_291=l9_280;
sc_SoftwareWrapLate(l9_290,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatRoughnessTexture).x,(int(SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_clearcoatRoughnessTexture)!=0)),l9_291);
float l9_292=l9_289.y;
float l9_293=l9_291;
sc_SoftwareWrapLate(l9_292,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatRoughnessTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatRoughnessTexture).y,(int(SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_clearcoatRoughnessTexture)!=0)),l9_293);
float l9_294=l9_293;
vec3 l9_295=sc_SamplingCoordsViewToGlobal(vec2(l9_290,l9_292),clearcoatRoughnessTextureLayout,l9_274);
vec4 l9_296=texture2D(clearcoatRoughnessTexture,l9_295.xy,0.0);
vec4 l9_297;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatRoughnessTexture)
{
l9_297=mix(clearcoatRoughnessTextureBorderColor,l9_296,vec4(l9_294));
}
#else
{
l9_297=l9_296;
}
#endif
N3_ClearcoatRoughness=ssSRGB_to_Linear(l9_297.y);
}
N3_ClearcoatRoughness*=N3_ClearcoatRoughnessFactor;
if (N3_EnableClearCoatNormalTexture)
{
vec2 l9_298=N3_getUV(N3_ClearcoatNormalMapCoord);
vec2 l9_299;
if (N3_EnableTextureTransform&&N3_ClearcoatNormalTextureTransform)
{
l9_299=N3_uvTransform(l9_298,N3_ClearcoatNormalTextureOffset,N3_ClearcoatNormalTextureScale,N3_ClearcoatNormalTextureRotation);
}
else
{
l9_299=l9_298;
}
int l9_300;
#if (clearcoatNormalTextureHasSwappedViews)
{
l9_300=1-sc_GetStereoViewIndex();
}
#else
{
l9_300=sc_GetStereoViewIndex();
}
#endif
float l9_301=l9_299.x;
sc_SoftwareWrapEarly(l9_301,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatNormalTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatNormalTexture).x);
float l9_302=l9_301;
float l9_303=l9_299.y;
sc_SoftwareWrapEarly(l9_303,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatNormalTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatNormalTexture).y);
float l9_304=l9_303;
vec2 l9_305;
float l9_306;
#if (SC_USE_UV_MIN_MAX_clearcoatNormalTexture)
{
bool l9_307;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture)
{
l9_307=ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatNormalTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatNormalTexture).x==3;
}
#else
{
l9_307=(int(SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture)!=0);
}
#endif
float l9_308=l9_302;
float l9_309=1.0;
sc_ClampUV(l9_308,clearcoatNormalTextureUvMinMax.x,clearcoatNormalTextureUvMinMax.z,l9_307,l9_309);
float l9_310=l9_308;
float l9_311=l9_309;
bool l9_312;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture)
{
l9_312=ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatNormalTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatNormalTexture).y==3;
}
#else
{
l9_312=(int(SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture)!=0);
}
#endif
float l9_313=l9_304;
float l9_314=l9_311;
sc_ClampUV(l9_313,clearcoatNormalTextureUvMinMax.y,clearcoatNormalTextureUvMinMax.w,l9_312,l9_314);
l9_306=l9_314;
l9_305=vec2(l9_310,l9_313);
}
#else
{
l9_306=1.0;
l9_305=vec2(l9_302,l9_304);
}
#endif
vec2 l9_315=sc_TransformUV(l9_305,(int(SC_USE_UV_TRANSFORM_clearcoatNormalTexture)!=0),clearcoatNormalTextureTransform);
float l9_316=l9_315.x;
float l9_317=l9_306;
sc_SoftwareWrapLate(l9_316,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatNormalTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatNormalTexture).x,(int(SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_clearcoatNormalTexture)!=0)),l9_317);
float l9_318=l9_315.y;
float l9_319=l9_317;
sc_SoftwareWrapLate(l9_318,ivec2(SC_SOFTWARE_WRAP_MODE_U_clearcoatNormalTexture,SC_SOFTWARE_WRAP_MODE_V_clearcoatNormalTexture).y,(int(SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_clearcoatNormalTexture)!=0)),l9_319);
float l9_320=l9_319;
vec3 l9_321=sc_SamplingCoordsViewToGlobal(vec2(l9_316,l9_318),clearcoatNormalTextureLayout,l9_300);
vec4 l9_322=texture2D(clearcoatNormalTexture,l9_321.xy,0.0);
vec4 l9_323;
#if (SC_USE_CLAMP_TO_BORDER_clearcoatNormalTexture)
{
l9_323=mix(clearcoatNormalTextureBorderColor,l9_322,vec4(l9_320));
}
#else
{
l9_323=l9_322;
}
#endif
N3_ClearcoatNormal=l9_323.xyz;
N3_ClearcoatNormal*=0.9921875;
}
}
vec3 l9_324=N3_BaseColor;
float l9_325=N3_Opacity;
vec3 l9_326=N3_Normal;
vec3 l9_327=N3_Emissive;
float l9_328=N3_Metallic;
float l9_329=N3_Roughness;
vec3 l9_330=N3_Background;
vec4 l9_331=N3_SheenOut;
float l9_332=N3_ClearcoatBase;
vec3 l9_333=N3_ClearcoatNormal;
float l9_334=N3_ClearcoatRoughness;
vec3 l9_335;
#if (!sc_ProjectiveShadowsCaster)
{
l9_335=l9_326;
}
#else
{
l9_335=Globals.BumpedNormal;
}
#endif
float l9_336=clamp(l9_325,0.0,1.0);
ngsAlphaTest(l9_336);
vec3 l9_337=max(l9_324,vec3(0.0));
vec4 l9_338;
#if (sc_ProjectiveShadowsCaster)
{
l9_338=vec4(l9_337,l9_336);
}
#else
{
l9_338=ngsCalculateLighting(l9_337,l9_336,l9_335,Globals.PositionWS,Globals.ViewDirWS,max(l9_327,vec3(0.0)),clamp(l9_328,0.0,1.0),clamp(l9_329,0.0,1.0),clamp(N3_Occlusion.xyz,vec3(0.0),vec3(1.0)),Port_SpecularAO_N036);
}
#endif
vec4 l9_339=max(l9_338,vec4(0.0));
vec3 l9_340;
#if (!sc_ProjectiveShadowsCaster)
{
l9_340=mat3(Globals.VertexTangent_WorldSpace,Globals.VertexBinormal_WorldSpace,Globals.VertexNormal_WorldSpace)*l9_333;
}
#else
{
l9_340=Globals.BumpedNormal;
}
#endif
ngsAlphaTest(Port_Opacity_N405);
vec4 l9_341;
#if (sc_ProjectiveShadowsCaster)
{
l9_341=vec4(Port_Albedo_N405,Port_Opacity_N405);
}
#else
{
l9_341=ngsCalculateLighting(Port_Albedo_N405,Port_Opacity_N405,l9_340,Globals.PositionWS,Globals.ViewDirWS,Port_Emissive_N405,Port_Metallic_N405,clamp(l9_334,0.0,1.0),vec3(1.0),Port_SpecularAO_N405);
}
#endif
tempGlobals=Globals;
N31_PbrIn=l9_339;
N31_EnableTransmission=(int(ENABLE_TRANSMISSION)!=0);
N31_Opacity=l9_325;
N31_Background=l9_330;
N31_EnableSheen=(int(ENABLE_SHEEN)!=0);
N31_SheenColor=l9_331;
N31_EnableClearcoat=(int(ENABLE_CLEARCOAT)!=0);
N31_ClearcoatBase=l9_332;
N31_ClearcoatColor=max(l9_341,vec4(0.0));
N31_Result=N31_PbrIn;
if ((N31_EnableSheen||N31_EnableTransmission)||N31_EnableClearcoat)
{
N31_Result=ssSRGB_to_Linear(N31_Result);
if (N31_EnableSheen)
{
vec3 l9_342=(N31_Result.xyz*N31_SheenColor.w)+N31_SheenColor.xyz;
N31_Result=vec4(l9_342.x,l9_342.y,l9_342.z,N31_Result.w);
}
if (N31_EnableTransmission)
{
N31_Result=mix(vec4(N31_Background,1.0),N31_Result,vec4(ssSRGB_to_Linear(N31_Opacity)));
N31_Result.w=1.0;
}
if (N31_EnableClearcoat)
{
vec3 l9_343=N31_Result.xyz+(ssSRGB_to_Linear(N31_ClearcoatColor)*N31_ClearcoatBase).xyz;
N31_Result=vec4(l9_343.x,l9_343.y,l9_343.z,N31_Result.w);
}
N31_Result=ssLinear_to_SRGB(N31_Result);
}
Input1=N31_Result;
Output=Input1;
}
#else
{
float param_21;
Node40_Bool_Parameter(param_21,Globals);
float param_23;
Node121_Bool_Parameter(param_23,Globals);
float param_25;
Node48_Bool_Parameter(param_25,Globals);
float param_27;
Node88_Bool_Parameter(param_27,Globals);
vec3 param_38;
float param_39;
vec4 param_40;
Node35_Unlit(param_21,param_23,float(NODE_7_DROPLIST_ITEM),baseColorFactor,param_25,param_27,baseColorTexture_offset,baseColorTexture_scale,baseColorTexture_rotation,param_38,param_39,param_40,Globals);
Input2=param_40;
Output=Input2;
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
N31_PbrIn=vec4(0.0);
N31_EnableTransmission=false;
N31_Opacity=0.0;
N31_Background=vec3(0.0);
N31_EnableSheen=false;
N31_SheenColor=vec4(0.0);
N31_EnableClearcoat=false;
N31_ClearcoatBase=0.0;
N31_ClearcoatColor=vec4(0.0);
N31_Result=vec4(0.0);
N3_DebugSheenEnvLightMult=0.0;
N3_DebugSheenPunctualLightMult=0.0;
N3_EmissiveColor=vec3(0.0);
N3_EnableEmissiveTexture=false;
N3_EmissiveTextureCoord=0;
N3_EnableNormalTexture=false;
N3_NormalScale=0.0;
N3_NormalTextureCoord=0;
N3_MetallicValue=0.0;
N3_RoughnessValue=0.0;
N3_EnableMetallicRoughnessTexture=false;
N3_OcclusionStrength=0.0;
N3_MaterialParamsTextureCoord=0;
N3_TransmissionEnable=false;
N3_TransmissionFactor=0.0;
N3_EnableTransmissionTexture=false;
N3_TransmissionTextureCoord=0;
N3_SheenEnable=false;
N3_SheenColorFactor=vec3(0.0);
N3_EnableSheenTexture=false;
N3_SheenColorTextureCoord=0;
N3_SheenRoughnessFactor=0.0;
N3_EnableSheenRoughnessTexture=false;
N3_SheenRoughnessTextureCoord=0;
N3_ClearcoatEnable=false;
N3_ClearcoatFactor=0.0;
N3_EnableClearcoatTexture=false;
N3_ClearcoatTextureCoord=0;
N3_ClearcoatRoughnessFactor=0.0;
N3_EnableClearCoatRoughnessTexture=false;
N3_ClearcoatRoughnessTextureCoord=0;
N3_EnableClearCoatNormalTexture=false;
N3_ClearcoatNormalMapCoord=0;
N3_BaseColorIn=vec3(0.0);
N3_OpacityIn=0.0;
N3_EnableTextureTransform=false;
N3_EmissiveTextureTransform=false;
N3_EmissiveTextureOffset=vec2(0.0);
N3_EmissiveTextureScale=vec2(0.0);
N3_EmissiveTextureRotation=0.0;
N3_NormalTextureTransform=false;
N3_NormalTextureOffset=vec2(0.0);
N3_NormalTextureScale=vec2(0.0);
N3_NormalTextureRotation=0.0;
N3_MaterialParamsTextureTransform=false;
N3_MaterialParamsTextureOffset=vec2(0.0);
N3_MaterialParamsTextureScale=vec2(0.0);
N3_MaterialParamsTextureRotation=0.0;
N3_TransmissionTextureTransform=false;
N3_TransmissionTextureOffset=vec2(0.0);
N3_TransmissionTextureScale=vec2(0.0);
N3_TransmissionTextureRotation=0.0;
N3_SheenColorTextureTransform=false;
N3_SheenColorTextureOffset=vec2(0.0);
N3_SheenColorTextureScale=vec2(0.0);
N3_SheenColorTextureRotation=0.0;
N3_SheenRoughnessTextureTransform=false;
N3_SheenRoughnessTextureOffset=vec2(0.0);
N3_SheenRoughnessTextureScale=vec2(0.0);
N3_SheenRoughnessTextureRotation=0.0;
N3_ClearcoatTextureTransform=false;
N3_ClearcoatTextureOffset=vec2(0.0);
N3_ClearcoatTextureScale=vec2(0.0);
N3_ClearcoatTextureRotation=0.0;
N3_ClearcoatNormalTextureTransform=false;
N3_ClearcoatNormalTextureOffset=vec2(0.0);
N3_ClearcoatNormalTextureScale=vec2(0.0);
N3_ClearcoatNormalTextureRotation=0.0;
N3_ClearcoatRoughnessTextureTransform=false;
N3_ClearcoatRoughnessTextureOffset=vec2(0.0);
N3_ClearcoatRoughnessTextureScale=vec2(0.0);
N3_ClearcoatRoughnessTextureRotation=0.0;
N3_BaseColor=vec3(0.0);
N3_Opacity=0.0;
N3_Normal=vec3(0.0);
N3_Emissive=vec3(0.0);
N3_Metallic=0.0;
N3_Roughness=0.0;
N3_Occlusion=vec4(0.0);
N3_Background=vec3(0.0);
N3_SheenOut=vec4(0.0);
N3_ClearcoatBase=0.0;
N3_ClearcoatNormal=vec3(0.0);
N3_ClearcoatRoughness=0.0;
N35_EnableVertexColor=false;
N35_EnableBaseTexture=false;
N35_BaseColorTextureCoord=0;
N35_BaseColorFactor=vec4(0.0);
N35_EnableTextureTransform=false;
N35_BaseTextureTransform=false;
N35_BaseTextureOffset=vec2(0.0);
N35_BaseTextureScale=vec2(0.0);
N35_BaseTextureRotation=0.0;
N35_BaseColor=vec3(0.0);
N35_Opacity=0.0;
N35_UnlitColor=vec4(0.0);
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
bool l9_0=overrideTimeEnabled==1;
float l9_1;
if (l9_0)
{
l9_1=overrideTimeElapsed;
}
else
{
l9_1=sc_Time.x;
}
float l9_2;
if (l9_0)
{
l9_2=overrideTimeDelta;
}
else
{
l9_2=sc_Time.y;
}
vec3 l9_3=normalize(varNormal);
vec3 l9_4=normalize(varTangent.xyz);
vec2 l9_5=gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw;
vec4 param_3;
Node17_Conditional(1.0,vec4(1.0),vec4(0.0),param_3,ssGlobals(l9_1,l9_2,0.0,vec3(0.0),normalize(sc_Camera.position-varPos),varPos,varPos,l9_3,l9_4,cross(l9_3,l9_4)*varTangent.w,varPackedTex.xy,varPackedTex.zw,sc_ScreenCoordsGlobalToView(l9_5),varColor));
vec4 l9_6=param_3;
vec4 l9_7=l9_6*vec4(colorMultiplier+1.0);
vec4 l9_8=vec4(l9_7.x,l9_7.y,l9_7.z,vec4(0.0).w);
l9_8.w=l9_6.w;
vec4 l9_9;
#if (sc_ProjectiveShadowsCaster)
{
float l9_10;
#if (((sc_BlendMode_Normal||sc_BlendMode_AlphaToCoverage)||sc_BlendMode_PremultipliedAlphaHardware)||sc_BlendMode_PremultipliedAlphaAuto)
{
l9_10=l9_6.w;
}
#else
{
float l9_11;
#if (sc_BlendMode_PremultipliedAlpha)
{
l9_11=clamp(l9_6.w*2.0,0.0,1.0);
}
#else
{
float l9_12;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_12=clamp(dot(l9_8.xyz,vec3(l9_6.w)),0.0,1.0);
}
#else
{
float l9_13;
#if (sc_BlendMode_AlphaTest)
{
l9_13=1.0;
}
#else
{
float l9_14;
#if (sc_BlendMode_Multiply)
{
l9_14=(1.0-dot(l9_8.xyz,vec3(0.33333001)))*l9_6.w;
}
#else
{
float l9_15;
#if (sc_BlendMode_MultiplyOriginal)
{
l9_15=(1.0-clamp(dot(l9_8.xyz,vec3(1.0)),0.0,1.0))*l9_6.w;
}
#else
{
float l9_16;
#if (sc_BlendMode_ColoredGlass)
{
l9_16=clamp(dot(l9_8.xyz,vec3(1.0)),0.0,1.0)*l9_6.w;
}
#else
{
float l9_17;
#if (sc_BlendMode_Add)
{
l9_17=clamp(dot(l9_8.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_18;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_18=clamp(dot(l9_8.xyz,vec3(1.0)),0.0,1.0)*l9_6.w;
}
#else
{
float l9_19;
#if (sc_BlendMode_Screen)
{
l9_19=dot(l9_8.xyz,vec3(0.33333001))*l9_6.w;
}
#else
{
float l9_20;
#if (sc_BlendMode_Min)
{
l9_20=1.0-clamp(dot(l9_8.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_21;
#if (sc_BlendMode_Max)
{
l9_21=clamp(dot(l9_8.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
l9_21=1.0;
}
#endif
l9_20=l9_21;
}
#endif
l9_19=l9_20;
}
#endif
l9_18=l9_19;
}
#endif
l9_17=l9_18;
}
#endif
l9_16=l9_17;
}
#endif
l9_15=l9_16;
}
#endif
l9_14=l9_15;
}
#endif
l9_13=l9_14;
}
#endif
l9_12=l9_13;
}
#endif
l9_11=l9_12;
}
#endif
l9_10=l9_11;
}
#endif
l9_9=vec4(mix(sc_ShadowColor.xyz,sc_ShadowColor.xyz*l9_8.xyz,vec3(sc_ShadowColor.w)),sc_ShadowDensity*l9_10);
}
#else
{
vec4 l9_22;
#if (sc_RenderAlphaToColor)
{
l9_22=vec4(l9_6.w);
}
#else
{
vec4 l9_23;
#if (sc_BlendMode_Custom)
{
vec3 l9_24=sc_GetFramebufferColor().xyz;
vec3 l9_25=mix(l9_24,definedBlend(l9_24,l9_8.xyz).xyz,vec3(l9_6.w));
vec4 l9_26=vec4(l9_25.x,l9_25.y,l9_25.z,vec4(0.0).w);
l9_26.w=1.0;
l9_23=l9_26;
}
#else
{
vec4 l9_27;
#if (sc_BlendMode_MultiplyOriginal)
{
l9_27=vec4(mix(vec3(1.0),l9_8.xyz,vec3(l9_6.w)),l9_6.w);
}
#else
{
vec4 l9_28;
#if (sc_BlendMode_Screen||sc_BlendMode_PremultipliedAlphaAuto)
{
float l9_29;
#if (sc_BlendMode_PremultipliedAlphaAuto)
{
l9_29=clamp(l9_6.w,0.0,1.0);
}
#else
{
l9_29=l9_6.w;
}
#endif
l9_28=vec4(l9_8.xyz*l9_29,l9_29);
}
#else
{
l9_28=l9_8;
}
#endif
l9_27=l9_28;
}
#endif
l9_23=l9_27;
}
#endif
l9_22=l9_23;
}
#endif
l9_9=l9_22;
}
#endif
vec4 l9_30;
if (PreviewEnabled==1)
{
vec4 l9_31;
if (((PreviewVertexSaved*1.0)!=0.0) ? true : false)
{
l9_31=PreviewVertexColor;
}
else
{
l9_31=vec4(0.0);
}
l9_30=l9_31;
}
else
{
l9_30=l9_9;
}
vec4 l9_32;
#if (sc_ShaderComplexityAnalyzer)
{
l9_32=vec4(shaderComplexityValue/255.0,0.0,0.0,1.0);
}
#else
{
l9_32=vec4(0.0);
}
#endif
vec4 l9_33;
if (l9_32.w>0.0)
{
l9_33=l9_32;
}
else
{
l9_33=l9_30;
}
vec4 l9_34=outputMotionVectorsIfNeeded(varPos,max(l9_33,vec4(0.0)));
vec4 l9_35=clamp(l9_34,vec4(0.0),vec4(1.0));
#if (sc_OITDepthBoundsPass)
{
#if (sc_OITDepthBoundsPass)
{
float l9_36=clamp(viewSpaceDepth()/1000.0,0.0,1.0);
sc_writeFragData0(vec4(max(0.0,1.0-(l9_36-0.0039215689)),min(1.0,l9_36+0.0039215689),0.0,0.0));
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
vec2 l9_37=sc_ScreenCoordsGlobalToView(l9_5);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,l9_37).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_38=encodeDepth(viewSpaceDepth(),texture2D(sc_OITFilteredDepthBoundsTexture,l9_37).xy);
float l9_39=packValue(l9_38);
int l9_46=int(l9_35.w*255.0);
float l9_47=packValue(l9_46);
sc_writeFragData0(vec4(packValue(l9_38),packValue(l9_38),packValue(l9_38),packValue(l9_38)));
sc_writeFragData1(vec4(l9_39,packValue(l9_38),packValue(l9_38),packValue(l9_38)));
sc_writeFragData2(vec4(l9_47,packValue(l9_46),packValue(l9_46),packValue(l9_46)));
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
vec2 l9_50=sc_ScreenCoordsGlobalToView(l9_5);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,l9_50).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_51[8];
int l9_52[8];
int l9_53=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_53<8)
{
l9_51[l9_53]=0;
l9_52[l9_53]=0;
l9_53++;
continue;
}
else
{
break;
}
}
int l9_54;
#if (sc_OITMaxLayers8)
{
l9_54=2;
}
#else
{
l9_54=1;
}
#endif
int l9_55=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_55<l9_54)
{
vec4 l9_56;
vec4 l9_57;
vec4 l9_58;
if (l9_55==0)
{
l9_58=texture2D(sc_OITAlpha0,l9_50);
l9_57=texture2D(sc_OITDepthLow0,l9_50);
l9_56=texture2D(sc_OITDepthHigh0,l9_50);
}
else
{
l9_58=vec4(0.0);
l9_57=vec4(0.0);
l9_56=vec4(0.0);
}
vec4 l9_59;
vec4 l9_60;
vec4 l9_61;
if (l9_55==1)
{
l9_61=texture2D(sc_OITAlpha1,l9_50);
l9_60=texture2D(sc_OITDepthLow1,l9_50);
l9_59=texture2D(sc_OITDepthHigh1,l9_50);
}
else
{
l9_61=l9_58;
l9_60=l9_57;
l9_59=l9_56;
}
if (any(notEqual(l9_59,vec4(0.0)))||any(notEqual(l9_60,vec4(0.0))))
{
int l9_62[8]=l9_51;
unpackValues(l9_59.w,l9_55,l9_62);
unpackValues(l9_59.z,l9_55,l9_62);
unpackValues(l9_59.y,l9_55,l9_62);
unpackValues(l9_59.x,l9_55,l9_62);
unpackValues(l9_60.w,l9_55,l9_62);
unpackValues(l9_60.z,l9_55,l9_62);
unpackValues(l9_60.y,l9_55,l9_62);
unpackValues(l9_60.x,l9_55,l9_62);
int l9_71[8]=l9_52;
unpackValues(l9_61.w,l9_55,l9_71);
unpackValues(l9_61.z,l9_55,l9_71);
unpackValues(l9_61.y,l9_55,l9_71);
unpackValues(l9_61.x,l9_55,l9_71);
}
l9_55++;
continue;
}
else
{
break;
}
}
vec4 l9_76=texture2D(sc_OITFilteredDepthBoundsTexture,l9_50);
vec2 l9_77=l9_76.xy;
int l9_78;
#if (sc_SkinBonesCount>0)
{
l9_78=encodeDepth(((1.0-l9_76.x)*1000.0)+getDepthOrderingEpsilon(),l9_77);
}
#else
{
l9_78=0;
}
#endif
int l9_79=encodeDepth(viewSpaceDepth(),l9_77);
vec4 l9_80;
l9_80=l9_35*l9_35.w;
vec4 l9_81;
int l9_82=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_82<8)
{
int l9_83=l9_51[l9_82];
int l9_84=l9_79-l9_78;
bool l9_85=l9_83<l9_84;
bool l9_86;
if (l9_85)
{
l9_86=l9_51[l9_82]>0;
}
else
{
l9_86=l9_85;
}
if (l9_86)
{
vec3 l9_87=l9_80.xyz*(1.0-(float(l9_52[l9_82])/255.0));
l9_81=vec4(l9_87.x,l9_87.y,l9_87.z,l9_80.w);
}
else
{
l9_81=l9_80;
}
l9_80=l9_81;
l9_82++;
continue;
}
else
{
break;
}
}
sc_writeFragData0(l9_80);
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
if (abs(gl_FragCoord.z-texture2D(sc_OITFrontDepthTexture,sc_ScreenCoordsGlobalToView(l9_5)).x)>getFrontLayerZTestEpsilon())
{
discard;
}
sc_writeFragData0(l9_35);
}
#endif
}
#else
{
sc_writeFragData0(l9_34);
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
