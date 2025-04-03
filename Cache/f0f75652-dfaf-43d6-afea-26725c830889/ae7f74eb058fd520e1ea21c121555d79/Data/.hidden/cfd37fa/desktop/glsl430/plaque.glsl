#version 430
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
//output uvec4 position_and_mask 0
//output uvec4 normal_and_more 1
//sampler sampler baseTexSmpSC 0:33
//sampler sampler detailNormalTexSmpSC 0:34
//sampler sampler emissiveTexSmpSC 0:35
//sampler sampler intensityTextureSmpSC 0:36
//sampler sampler materialParamsTexSmpSC 0:37
//sampler sampler normalTexSmpSC 0:38
//sampler sampler opacityTexSmpSC 0:39
//sampler sampler reflectionModulationTexSmpSC 0:40
//sampler sampler reflectionTexSmpSC 0:41
//sampler sampler rimColorTexSmpSC 0:42
//sampler sampler sc_EnvmapDiffuseSmpSC 0:43
//sampler sampler sc_EnvmapSpecularSmpSC 0:44
//sampler sampler sc_OITCommonSampler 0:45
//sampler sampler sc_RayTracedAoTextureSmpSC 0:46
//sampler sampler sc_RayTracedDiffIndTextureSmpSC 0:47
//sampler sampler sc_RayTracedReflectionTextureSmpSC 0:48
//sampler sampler sc_RayTracedShadowTextureSmpSC 0:49
//sampler sampler sc_SSAOTextureSmpSC 0:50
//sampler sampler sc_ScreenTextureSmpSC 0:51
//sampler sampler sc_ShadowTextureSmpSC 0:52
//sampler sampler z_hitIdAndBarycentricSmp 0:54
//sampler sampler z_rayDirectionsSmpSC 0:55
//texture texture2D baseTex 0:3:0:33
//texture texture2D detailNormalTex 0:4:0:34
//texture texture2D emissiveTex 0:5:0:35
//texture texture2D intensityTexture 0:6:0:36
//texture texture2D materialParamsTex 0:7:0:37
//texture texture2D normalTex 0:8:0:38
//texture texture2D opacityTex 0:9:0:39
//texture texture2D reflectionModulationTex 0:10:0:40
//texture texture2D reflectionTex 0:11:0:41
//texture texture2D rimColorTex 0:12:0:42
//texture texture2D sc_EnvmapDiffuse 0:13:0:43
//texture texture2D sc_EnvmapSpecular 0:14:0:44
//texture texture2D sc_OITAlpha0 0:15:0:45
//texture texture2D sc_OITAlpha1 0:16:0:45
//texture texture2D sc_OITDepthHigh0 0:17:0:45
//texture texture2D sc_OITDepthHigh1 0:18:0:45
//texture texture2D sc_OITDepthLow0 0:19:0:45
//texture texture2D sc_OITDepthLow1 0:20:0:45
//texture texture2D sc_OITFilteredDepthBoundsTexture 0:21:0:45
//texture texture2D sc_OITFrontDepthTexture 0:22:0:45
//texture texture2D sc_RayTracedAoTexture 0:23:0:46
//texture texture2D sc_RayTracedDiffIndTexture 0:24:0:47
//texture texture2D sc_RayTracedReflectionTexture 0:25:0:48
//texture texture2D sc_RayTracedShadowTexture 0:26:0:49
//texture texture2D sc_SSAOTexture 0:27:0:50
//texture texture2D sc_ScreenTexture 0:28:0:51
//texture texture2D sc_ShadowTexture 0:29:0:52
//texture utexture2D z_hitIdAndBarycentric 0:31:0:54
//texture texture2D z_rayDirections 0:32:0:55
//texture texture2DArray baseTexArrSC 0:56:0:33
//texture texture2DArray detailNormalTexArrSC 0:57:0:34
//texture texture2DArray emissiveTexArrSC 0:58:0:35
//texture texture2DArray intensityTextureArrSC 0:59:0:36
//texture texture2DArray materialParamsTexArrSC 0:60:0:37
//texture texture2DArray normalTexArrSC 0:61:0:38
//texture texture2DArray opacityTexArrSC 0:62:0:39
//texture texture2DArray reflectionModulationTexArrSC 0:63:0:40
//texture texture2DArray reflectionTexArrSC 0:64:0:41
//texture texture2DArray rimColorTexArrSC 0:65:0:42
//texture texture2DArray sc_EnvmapDiffuseArrSC 0:66:0:43
//texture texture2DArray sc_EnvmapSpecularArrSC 0:67:0:44
//texture texture2DArray sc_RayTracedAoTextureArrSC 0:68:0:46
//texture texture2DArray sc_RayTracedDiffIndTextureArrSC 0:69:0:47
//texture texture2DArray sc_RayTracedReflectionTextureArrSC 0:70:0:48
//texture texture2DArray sc_RayTracedShadowTextureArrSC 0:71:0:49
//texture texture2DArray sc_ScreenTextureArrSC 0:72:0:51
//ssbo int layoutIndices 0:0:4 {
//uint _Triangles 0:[]:4
//}
//ssbo float layoutVertices 0:1:4 {
//float _Vertices 0:[]:4
//}
//ssbo float layoutVerticesPN 0:2:4 {
//float _VerticesPN 0:[]:4
//}
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
#ifdef uv2
#undef uv2
#endif
#ifdef uv3
#undef uv3
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
layout(binding=0,std430) readonly buffer layoutIndices
{
uint _Triangles[];
} layoutIndices_obj;
layout(binding=1,std430) readonly buffer layoutVertices
{
float _Vertices[];
} layoutVertices_obj;
layout(binding=2,std430) readonly buffer layoutVerticesPN
{
float _VerticesPN[];
} layoutVerticesPN_obj;
uniform vec4 sc_EnvmapDiffuseDims;
uniform vec4 sc_EnvmapSpecularDims;
uniform vec4 sc_ScreenTextureDims;
uniform bool receivesRayTracedReflections;
uniform bool isProxyMode;
uniform bool receivesRayTracedShadows;
uniform bool receivesRayTracedDiffuseIndirect;
uniform bool receivesRayTracedAo;
uniform vec4 sc_RayTracedReflectionTextureDims;
uniform vec4 sc_RayTracedShadowTextureDims;
uniform vec4 sc_RayTracedDiffIndTextureDims;
uniform vec4 sc_RayTracedAoTextureDims;
uniform bool noEarlyZ;
uniform vec4 z_rayDirectionsDims;
uniform mat4 sc_ModelMatrix;
uniform mat4 sc_ProjectorMatrix;
uniform vec4 sc_StereoClipPlanes[sc_NumStereoViews];
uniform vec4 sc_UniformConstants;
uniform vec4 sc_BoneMatrices[(sc_SkinBonesCount*3)+1];
uniform mat3 sc_SkinBonesNormalMatrices[sc_SkinBonesCount+1];
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
uniform vec4 baseTexDims;
uniform vec4 opacityTexDims;
uniform vec4 normalTexDims;
uniform vec4 detailNormalTexDims;
uniform vec4 emissiveTexDims;
uniform vec4 reflectionTexDims;
uniform vec4 reflectionModulationTexDims;
uniform vec4 rimColorTexDims;
uniform vec4 materialParamsTexDims;
uniform float depthRef;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform float overrideTimeDelta;
uniform sc_PointLight_t sc_PointLights[sc_PointLightsCount+1];
uniform sc_DirectionalLight_t sc_DirectionalLights[sc_DirectionalLightsCount+1];
uniform sc_AmbientLight_t sc_AmbientLights[sc_AmbientLightsCount+1];
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
uniform vec4 sc_RayTracedReflectionTextureSize;
uniform vec4 sc_RayTracedReflectionTextureView;
uniform vec4 sc_RayTracedShadowTextureSize;
uniform vec4 sc_RayTracedShadowTextureView;
uniform vec4 sc_RayTracedDiffIndTextureSize;
uniform vec4 sc_RayTracedDiffIndTextureView;
uniform vec4 sc_RayTracedAoTextureSize;
uniform vec4 sc_RayTracedAoTextureView;
uniform float receiver_mask;
uniform vec3 OriginNormalizationScale;
uniform vec3 OriginNormalizationScaleInv;
uniform vec3 OriginNormalizationOffset;
uniform int receiverId;
uniform int instance_id;
uniform int lray_triangles_last;
uniform bool has_animated_pn;
uniform int emitter_stride;
uniform int proxy_offset_position;
uniform int proxy_offset_normal;
uniform int proxy_offset_tangent;
uniform int proxy_offset_color;
uniform int proxy_offset_texture0;
uniform int proxy_offset_texture1;
uniform int proxy_offset_texture2;
uniform int proxy_offset_texture3;
uniform int proxy_format_position;
uniform int proxy_format_normal;
uniform int proxy_format_tangent;
uniform int proxy_format_color;
uniform int proxy_format_texture0;
uniform int proxy_format_texture1;
uniform int proxy_format_texture2;
uniform int proxy_format_texture3;
uniform vec4 z_rayDirectionsSize;
uniform vec4 z_rayDirectionsView;
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
uniform vec4 baseColor;
uniform vec4 baseTexSize;
uniform vec4 baseTexView;
uniform mat3 baseTexTransform;
uniform vec4 baseTexUvMinMax;
uniform vec4 baseTexBorderColor;
uniform vec3 recolorRed;
uniform vec3 recolorGreen;
uniform vec3 recolorBlue;
uniform vec4 opacityTexSize;
uniform vec4 opacityTexView;
uniform mat3 opacityTexTransform;
uniform vec4 opacityTexUvMinMax;
uniform vec4 opacityTexBorderColor;
uniform vec4 normalTexSize;
uniform vec4 normalTexView;
uniform mat3 normalTexTransform;
uniform vec4 normalTexUvMinMax;
uniform vec4 normalTexBorderColor;
uniform vec4 detailNormalTexSize;
uniform vec4 detailNormalTexView;
uniform mat3 detailNormalTexTransform;
uniform vec4 detailNormalTexUvMinMax;
uniform vec4 detailNormalTexBorderColor;
uniform vec4 emissiveTexSize;
uniform vec4 emissiveTexView;
uniform mat3 emissiveTexTransform;
uniform vec4 emissiveTexUvMinMax;
uniform vec4 emissiveTexBorderColor;
uniform vec3 emissiveColor;
uniform float emissiveIntensity;
uniform vec4 reflectionTexSize;
uniform vec4 reflectionTexView;
uniform mat3 reflectionTexTransform;
uniform vec4 reflectionTexUvMinMax;
uniform vec4 reflectionTexBorderColor;
uniform float reflectionIntensity;
uniform vec4 reflectionModulationTexSize;
uniform vec4 reflectionModulationTexView;
uniform mat3 reflectionModulationTexTransform;
uniform vec4 reflectionModulationTexUvMinMax;
uniform vec4 reflectionModulationTexBorderColor;
uniform vec3 rimColor;
uniform float rimIntensity;
uniform float rimExponent;
uniform vec4 rimColorTexSize;
uniform vec4 rimColorTexView;
uniform mat3 rimColorTexTransform;
uniform vec4 rimColorTexUvMinMax;
uniform vec4 rimColorTexBorderColor;
uniform float metallic;
uniform float roughness;
uniform vec4 materialParamsTexSize;
uniform vec4 materialParamsTexView;
uniform mat3 materialParamsTexTransform;
uniform vec4 materialParamsTexUvMinMax;
uniform vec4 materialParamsTexBorderColor;
uniform float specularAoIntensity;
uniform float specularAoDarkening;
uniform vec2 uv2Scale;
uniform vec2 uv2Offset;
uniform vec2 uv3Scale;
uniform vec2 uv3Offset;
out float varClipDistance;
flat out int varStereoViewID;
in vec4 boneData;
in vec3 blendShape0Pos;
in vec3 blendShape0Normal;
in vec3 blendShape1Pos;
in vec3 blendShape1Normal;
in vec3 blendShape2Pos;
in vec3 blendShape2Normal;
in vec3 blendShape3Pos;
in vec3 blendShape4Pos;
in vec3 blendShape5Pos;
in vec4 position;
in vec3 normal;
in vec4 tangent;
in vec2 texture0;
in vec2 texture1;
out vec3 varPos;
out vec3 varNormal;
out vec4 varTangent;
out vec4 varPackedTex;
out vec4 varScreenPos;
out vec2 varScreenTexturePos;
out vec2 varShadowTex;
out float varViewSpaceDepth;
out vec4 varColor;
in vec4 color;
out vec4 PreviewVertexColor;
out float PreviewVertexSaved;
in vec3 positionNext;
in vec3 positionPrevious;
in vec4 strandProperties;
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
varStereoViewID=sc_StereoViewID;
}
#endif
sc_SetClipDistance(clipPosition);
gl_Position=clipPosition;
}
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
void main()
{
if (isProxyMode)
{
sc_SetClipPosition(vec4(position.xy,depthRef+(1e-10*position.z),1.0+(1e-10*position.w)));
return;
}
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
sc_SetClipPosition(l9_45);
}
#elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
#if SC_RT_RECEIVER_MODE
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
vec2 N7_TransformedUV2;
vec2 N7_TransformedUV3;
vec3 BumpedNormal;
vec3 ViewDirWS;
vec3 PositionWS;
vec3 VertexNormal_WorldSpace;
vec3 VertexTangent_WorldSpace;
vec3 VertexBinormal_WorldSpace;
vec2 Surface_UVCoord0;
vec2 Surface_UVCoord1;
vec4 VertexColor;
vec2 gScreenCoord;
vec3 SurfacePosition_WorldSpace;
};
#ifndef sc_StereoRenderingMode
#define sc_StereoRenderingMode 0
#endif
#ifndef sc_NumStereoViews
#define sc_NumStereoViews 1
#endif
#ifndef sc_BlendMode_AlphaTest
#define sc_BlendMode_AlphaTest 0
#elif sc_BlendMode_AlphaTest==1
#undef sc_BlendMode_AlphaTest
#define sc_BlendMode_AlphaTest 1
#endif
struct sc_Camera_t
{
vec3 position;
float aspect;
vec2 clipPlanes;
};
#ifndef ENABLE_STIPPLE_PATTERN_TEST
#define ENABLE_STIPPLE_PATTERN_TEST 0
#elif ENABLE_STIPPLE_PATTERN_TEST==1
#undef ENABLE_STIPPLE_PATTERN_TEST
#define ENABLE_STIPPLE_PATTERN_TEST 1
#endif
#ifndef baseTexHasSwappedViews
#define baseTexHasSwappedViews 0
#elif baseTexHasSwappedViews==1
#undef baseTexHasSwappedViews
#define baseTexHasSwappedViews 1
#endif
#ifndef baseTexLayout
#define baseTexLayout 0
#endif
#ifndef opacityTexHasSwappedViews
#define opacityTexHasSwappedViews 0
#elif opacityTexHasSwappedViews==1
#undef opacityTexHasSwappedViews
#define opacityTexHasSwappedViews 1
#endif
#ifndef opacityTexLayout
#define opacityTexLayout 0
#endif
#ifndef normalTexHasSwappedViews
#define normalTexHasSwappedViews 0
#elif normalTexHasSwappedViews==1
#undef normalTexHasSwappedViews
#define normalTexHasSwappedViews 1
#endif
#ifndef normalTexLayout
#define normalTexLayout 0
#endif
#ifndef detailNormalTexHasSwappedViews
#define detailNormalTexHasSwappedViews 0
#elif detailNormalTexHasSwappedViews==1
#undef detailNormalTexHasSwappedViews
#define detailNormalTexHasSwappedViews 1
#endif
#ifndef detailNormalTexLayout
#define detailNormalTexLayout 0
#endif
#ifndef emissiveTexHasSwappedViews
#define emissiveTexHasSwappedViews 0
#elif emissiveTexHasSwappedViews==1
#undef emissiveTexHasSwappedViews
#define emissiveTexHasSwappedViews 1
#endif
#ifndef emissiveTexLayout
#define emissiveTexLayout 0
#endif
#ifndef reflectionTexHasSwappedViews
#define reflectionTexHasSwappedViews 0
#elif reflectionTexHasSwappedViews==1
#undef reflectionTexHasSwappedViews
#define reflectionTexHasSwappedViews 1
#endif
#ifndef reflectionTexLayout
#define reflectionTexLayout 0
#endif
#ifndef reflectionModulationTexHasSwappedViews
#define reflectionModulationTexHasSwappedViews 0
#elif reflectionModulationTexHasSwappedViews==1
#undef reflectionModulationTexHasSwappedViews
#define reflectionModulationTexHasSwappedViews 1
#endif
#ifndef reflectionModulationTexLayout
#define reflectionModulationTexLayout 0
#endif
#ifndef rimColorTexHasSwappedViews
#define rimColorTexHasSwappedViews 0
#elif rimColorTexHasSwappedViews==1
#undef rimColorTexHasSwappedViews
#define rimColorTexHasSwappedViews 1
#endif
#ifndef rimColorTexLayout
#define rimColorTexLayout 0
#endif
#ifndef materialParamsTexHasSwappedViews
#define materialParamsTexHasSwappedViews 0
#elif materialParamsTexHasSwappedViews==1
#undef materialParamsTexHasSwappedViews
#define materialParamsTexHasSwappedViews 1
#endif
#ifndef materialParamsTexLayout
#define materialParamsTexLayout 0
#endif
struct sc_LightEstimationData_t
{
sc_SphericalGaussianLight_t sg[12];
vec3 ambientLight;
};
#ifndef sc_AmbientLightsCount
#define sc_AmbientLightsCount 0
#endif
struct sc_AmbientLight_t
{
vec3 color;
float intensity;
};
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
#ifndef NODE_38_DROPLIST_ITEM
#define NODE_38_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_BASE_TEX
#define ENABLE_BASE_TEX 0
#elif ENABLE_BASE_TEX==1
#undef ENABLE_BASE_TEX
#define ENABLE_BASE_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex
#define SC_USE_UV_TRANSFORM_baseTex 0
#elif SC_USE_UV_TRANSFORM_baseTex==1
#undef SC_USE_UV_TRANSFORM_baseTex
#define SC_USE_UV_TRANSFORM_baseTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex
#define SC_SOFTWARE_WRAP_MODE_U_baseTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex
#define SC_SOFTWARE_WRAP_MODE_V_baseTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex
#define SC_USE_UV_MIN_MAX_baseTex 0
#elif SC_USE_UV_MIN_MAX_baseTex==1
#undef SC_USE_UV_MIN_MAX_baseTex
#define SC_USE_UV_MIN_MAX_baseTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex
#define SC_USE_CLAMP_TO_BORDER_baseTex 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex
#define SC_USE_CLAMP_TO_BORDER_baseTex 1
#endif
#ifndef NODE_27_DROPLIST_ITEM
#define NODE_27_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_RECOLOR
#define ENABLE_RECOLOR 0
#elif ENABLE_RECOLOR==1
#undef ENABLE_RECOLOR
#define ENABLE_RECOLOR 1
#endif
#ifndef ENABLE_OPACITY_TEX
#define ENABLE_OPACITY_TEX 0
#elif ENABLE_OPACITY_TEX==1
#undef ENABLE_OPACITY_TEX
#define ENABLE_OPACITY_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_opacityTex
#define SC_USE_UV_TRANSFORM_opacityTex 0
#elif SC_USE_UV_TRANSFORM_opacityTex==1
#undef SC_USE_UV_TRANSFORM_opacityTex
#define SC_USE_UV_TRANSFORM_opacityTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_opacityTex
#define SC_SOFTWARE_WRAP_MODE_U_opacityTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_opacityTex
#define SC_SOFTWARE_WRAP_MODE_V_opacityTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_opacityTex
#define SC_USE_UV_MIN_MAX_opacityTex 0
#elif SC_USE_UV_MIN_MAX_opacityTex==1
#undef SC_USE_UV_MIN_MAX_opacityTex
#define SC_USE_UV_MIN_MAX_opacityTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_opacityTex
#define SC_USE_CLAMP_TO_BORDER_opacityTex 0
#elif SC_USE_CLAMP_TO_BORDER_opacityTex==1
#undef SC_USE_CLAMP_TO_BORDER_opacityTex
#define SC_USE_CLAMP_TO_BORDER_opacityTex 1
#endif
#ifndef NODE_69_DROPLIST_ITEM
#define NODE_69_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_NORMALMAP
#define ENABLE_NORMALMAP 0
#elif ENABLE_NORMALMAP==1
#undef ENABLE_NORMALMAP
#define ENABLE_NORMALMAP 1
#endif
#ifndef SC_USE_UV_TRANSFORM_normalTex
#define SC_USE_UV_TRANSFORM_normalTex 0
#elif SC_USE_UV_TRANSFORM_normalTex==1
#undef SC_USE_UV_TRANSFORM_normalTex
#define SC_USE_UV_TRANSFORM_normalTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_normalTex
#define SC_SOFTWARE_WRAP_MODE_U_normalTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_normalTex
#define SC_SOFTWARE_WRAP_MODE_V_normalTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_normalTex
#define SC_USE_UV_MIN_MAX_normalTex 0
#elif SC_USE_UV_MIN_MAX_normalTex==1
#undef SC_USE_UV_MIN_MAX_normalTex
#define SC_USE_UV_MIN_MAX_normalTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_normalTex
#define SC_USE_CLAMP_TO_BORDER_normalTex 0
#elif SC_USE_CLAMP_TO_BORDER_normalTex==1
#undef SC_USE_CLAMP_TO_BORDER_normalTex
#define SC_USE_CLAMP_TO_BORDER_normalTex 1
#endif
#ifndef NODE_181_DROPLIST_ITEM
#define NODE_181_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_DETAIL_NORMAL
#define ENABLE_DETAIL_NORMAL 0
#elif ENABLE_DETAIL_NORMAL==1
#undef ENABLE_DETAIL_NORMAL
#define ENABLE_DETAIL_NORMAL 1
#endif
#ifndef SC_USE_UV_TRANSFORM_detailNormalTex
#define SC_USE_UV_TRANSFORM_detailNormalTex 0
#elif SC_USE_UV_TRANSFORM_detailNormalTex==1
#undef SC_USE_UV_TRANSFORM_detailNormalTex
#define SC_USE_UV_TRANSFORM_detailNormalTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_detailNormalTex
#define SC_SOFTWARE_WRAP_MODE_U_detailNormalTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_detailNormalTex
#define SC_SOFTWARE_WRAP_MODE_V_detailNormalTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_detailNormalTex
#define SC_USE_UV_MIN_MAX_detailNormalTex 0
#elif SC_USE_UV_MIN_MAX_detailNormalTex==1
#undef SC_USE_UV_MIN_MAX_detailNormalTex
#define SC_USE_UV_MIN_MAX_detailNormalTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_detailNormalTex
#define SC_USE_CLAMP_TO_BORDER_detailNormalTex 0
#elif SC_USE_CLAMP_TO_BORDER_detailNormalTex==1
#undef SC_USE_CLAMP_TO_BORDER_detailNormalTex
#define SC_USE_CLAMP_TO_BORDER_detailNormalTex 1
#endif
#ifndef NODE_184_DROPLIST_ITEM
#define NODE_184_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_EMISSIVE
#define ENABLE_EMISSIVE 0
#elif ENABLE_EMISSIVE==1
#undef ENABLE_EMISSIVE
#define ENABLE_EMISSIVE 1
#endif
#ifndef SC_USE_UV_TRANSFORM_emissiveTex
#define SC_USE_UV_TRANSFORM_emissiveTex 0
#elif SC_USE_UV_TRANSFORM_emissiveTex==1
#undef SC_USE_UV_TRANSFORM_emissiveTex
#define SC_USE_UV_TRANSFORM_emissiveTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_emissiveTex
#define SC_SOFTWARE_WRAP_MODE_U_emissiveTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_emissiveTex
#define SC_SOFTWARE_WRAP_MODE_V_emissiveTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_emissiveTex
#define SC_USE_UV_MIN_MAX_emissiveTex 0
#elif SC_USE_UV_MIN_MAX_emissiveTex==1
#undef SC_USE_UV_MIN_MAX_emissiveTex
#define SC_USE_UV_MIN_MAX_emissiveTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_emissiveTex
#define SC_USE_CLAMP_TO_BORDER_emissiveTex 0
#elif SC_USE_CLAMP_TO_BORDER_emissiveTex==1
#undef SC_USE_CLAMP_TO_BORDER_emissiveTex
#define SC_USE_CLAMP_TO_BORDER_emissiveTex 1
#endif
#ifndef NODE_76_DROPLIST_ITEM
#define NODE_76_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_SIMPLE_REFLECTION
#define ENABLE_SIMPLE_REFLECTION 0
#elif ENABLE_SIMPLE_REFLECTION==1
#undef ENABLE_SIMPLE_REFLECTION
#define ENABLE_SIMPLE_REFLECTION 1
#endif
#ifndef SC_USE_UV_TRANSFORM_reflectionTex
#define SC_USE_UV_TRANSFORM_reflectionTex 0
#elif SC_USE_UV_TRANSFORM_reflectionTex==1
#undef SC_USE_UV_TRANSFORM_reflectionTex
#define SC_USE_UV_TRANSFORM_reflectionTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_reflectionTex
#define SC_SOFTWARE_WRAP_MODE_U_reflectionTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_reflectionTex
#define SC_SOFTWARE_WRAP_MODE_V_reflectionTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_reflectionTex
#define SC_USE_UV_MIN_MAX_reflectionTex 0
#elif SC_USE_UV_MIN_MAX_reflectionTex==1
#undef SC_USE_UV_MIN_MAX_reflectionTex
#define SC_USE_UV_MIN_MAX_reflectionTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_reflectionTex
#define SC_USE_CLAMP_TO_BORDER_reflectionTex 0
#elif SC_USE_CLAMP_TO_BORDER_reflectionTex==1
#undef SC_USE_CLAMP_TO_BORDER_reflectionTex
#define SC_USE_CLAMP_TO_BORDER_reflectionTex 1
#endif
#ifndef Tweak_N177
#define Tweak_N177 0
#elif Tweak_N177==1
#undef Tweak_N177
#define Tweak_N177 1
#endif
#ifndef NODE_228_DROPLIST_ITEM
#define NODE_228_DROPLIST_ITEM 0
#endif
#ifndef SC_USE_UV_TRANSFORM_reflectionModulationTex
#define SC_USE_UV_TRANSFORM_reflectionModulationTex 0
#elif SC_USE_UV_TRANSFORM_reflectionModulationTex==1
#undef SC_USE_UV_TRANSFORM_reflectionModulationTex
#define SC_USE_UV_TRANSFORM_reflectionModulationTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex
#define SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex
#define SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_reflectionModulationTex
#define SC_USE_UV_MIN_MAX_reflectionModulationTex 0
#elif SC_USE_UV_MIN_MAX_reflectionModulationTex==1
#undef SC_USE_UV_MIN_MAX_reflectionModulationTex
#define SC_USE_UV_MIN_MAX_reflectionModulationTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_reflectionModulationTex
#define SC_USE_CLAMP_TO_BORDER_reflectionModulationTex 0
#elif SC_USE_CLAMP_TO_BORDER_reflectionModulationTex==1
#undef SC_USE_CLAMP_TO_BORDER_reflectionModulationTex
#define SC_USE_CLAMP_TO_BORDER_reflectionModulationTex 1
#endif
#ifndef ENABLE_RIM_HIGHLIGHT
#define ENABLE_RIM_HIGHLIGHT 0
#elif ENABLE_RIM_HIGHLIGHT==1
#undef ENABLE_RIM_HIGHLIGHT
#define ENABLE_RIM_HIGHLIGHT 1
#endif
#ifndef Tweak_N216
#define Tweak_N216 0
#elif Tweak_N216==1
#undef Tweak_N216
#define Tweak_N216 1
#endif
#ifndef ENABLE_RIM_INVERT
#define ENABLE_RIM_INVERT 0
#elif ENABLE_RIM_INVERT==1
#undef ENABLE_RIM_INVERT
#define ENABLE_RIM_INVERT 1
#endif
#ifndef SC_USE_UV_TRANSFORM_rimColorTex
#define SC_USE_UV_TRANSFORM_rimColorTex 0
#elif SC_USE_UV_TRANSFORM_rimColorTex==1
#undef SC_USE_UV_TRANSFORM_rimColorTex
#define SC_USE_UV_TRANSFORM_rimColorTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_rimColorTex
#define SC_SOFTWARE_WRAP_MODE_U_rimColorTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_rimColorTex
#define SC_SOFTWARE_WRAP_MODE_V_rimColorTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_rimColorTex
#define SC_USE_UV_MIN_MAX_rimColorTex 0
#elif SC_USE_UV_MIN_MAX_rimColorTex==1
#undef SC_USE_UV_MIN_MAX_rimColorTex
#define SC_USE_UV_MIN_MAX_rimColorTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_rimColorTex
#define SC_USE_CLAMP_TO_BORDER_rimColorTex 0
#elif SC_USE_CLAMP_TO_BORDER_rimColorTex==1
#undef SC_USE_CLAMP_TO_BORDER_rimColorTex
#define SC_USE_CLAMP_TO_BORDER_rimColorTex 1
#endif
#ifndef NODE_315_DROPLIST_ITEM
#define NODE_315_DROPLIST_ITEM 0
#endif
#ifndef SC_USE_UV_TRANSFORM_materialParamsTex
#define SC_USE_UV_TRANSFORM_materialParamsTex 0
#elif SC_USE_UV_TRANSFORM_materialParamsTex==1
#undef SC_USE_UV_TRANSFORM_materialParamsTex
#define SC_USE_UV_TRANSFORM_materialParamsTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_materialParamsTex
#define SC_SOFTWARE_WRAP_MODE_U_materialParamsTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_materialParamsTex
#define SC_SOFTWARE_WRAP_MODE_V_materialParamsTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_materialParamsTex
#define SC_USE_UV_MIN_MAX_materialParamsTex 0
#elif SC_USE_UV_MIN_MAX_materialParamsTex==1
#undef SC_USE_UV_MIN_MAX_materialParamsTex
#define SC_USE_UV_MIN_MAX_materialParamsTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_materialParamsTex
#define SC_USE_CLAMP_TO_BORDER_materialParamsTex 0
#elif SC_USE_CLAMP_TO_BORDER_materialParamsTex==1
#undef SC_USE_CLAMP_TO_BORDER_materialParamsTex
#define SC_USE_CLAMP_TO_BORDER_materialParamsTex 1
#endif
#ifndef NODE_221_DROPLIST_ITEM
#define NODE_221_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_UV2
#define ENABLE_UV2 0
#elif ENABLE_UV2==1
#undef ENABLE_UV2
#define ENABLE_UV2 1
#endif
#ifndef NODE_13_DROPLIST_ITEM
#define NODE_13_DROPLIST_ITEM 0
#endif
#ifndef uv2EnableAnimation
#define uv2EnableAnimation 0
#elif uv2EnableAnimation==1
#undef uv2EnableAnimation
#define uv2EnableAnimation 1
#endif
#ifndef ENABLE_UV3
#define ENABLE_UV3 0
#elif ENABLE_UV3==1
#undef ENABLE_UV3
#define ENABLE_UV3 1
#endif
#ifndef NODE_49_DROPLIST_ITEM
#define NODE_49_DROPLIST_ITEM 0
#endif
#ifndef uv3EnableAnimation
#define uv3EnableAnimation 0
#elif uv3EnableAnimation==1
#undef uv3EnableAnimation
#define uv3EnableAnimation 1
#endif
#ifndef sc_ProjectiveShadowsCaster
#define sc_ProjectiveShadowsCaster 0
#elif sc_ProjectiveShadowsCaster==1
#undef sc_ProjectiveShadowsCaster
#define sc_ProjectiveShadowsCaster 1
#endif
#ifndef sc_DepthOnly
#define sc_DepthOnly 0
#elif sc_DepthOnly==1
#undef sc_DepthOnly
#define sc_DepthOnly 1
#endif
#ifndef sc_SkinBonesCount
#define sc_SkinBonesCount 0
#endif
layout(binding=0,std430) readonly buffer layoutIndices
{
uint _Triangles[];
} layoutIndices_obj;
layout(binding=1,std430) readonly buffer layoutVertices
{
float _Vertices[];
} layoutVertices_obj;
layout(binding=2,std430) readonly buffer layoutVerticesPN
{
float _VerticesPN[];
} layoutVerticesPN_obj;
uniform vec4 sc_EnvmapDiffuseDims;
uniform vec4 sc_EnvmapSpecularDims;
uniform vec4 sc_ScreenTextureDims;
uniform bool receivesRayTracedReflections;
uniform bool isProxyMode;
uniform bool receivesRayTracedShadows;
uniform bool receivesRayTracedDiffuseIndirect;
uniform bool receivesRayTracedAo;
uniform vec4 sc_RayTracedReflectionTextureDims;
uniform vec4 sc_RayTracedShadowTextureDims;
uniform vec4 sc_RayTracedDiffIndTextureDims;
uniform vec4 sc_RayTracedAoTextureDims;
uniform bool noEarlyZ;
uniform vec4 z_rayDirectionsDims;
uniform vec4 sc_CurrentRenderTargetDims;
uniform mat4 sc_ProjectionMatrixArray[sc_NumStereoViews];
uniform float sc_ShadowDensity;
uniform vec4 sc_ShadowColor;
uniform float shaderComplexityValue;
uniform mat4 sc_ViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameModelMatrix;
uniform mat4 sc_ModelMatrixInverse;
uniform sc_Camera_t sc_Camera;
uniform vec3 OriginNormalizationOffset;
uniform vec3 OriginNormalizationScale;
uniform float receiver_mask;
uniform int receiverId;
uniform vec4 intensityTextureDims;
uniform float alphaTestThreshold;
uniform vec4 baseTexDims;
uniform vec4 opacityTexDims;
uniform vec4 normalTexDims;
uniform vec4 detailNormalTexDims;
uniform vec4 emissiveTexDims;
uniform vec4 reflectionTexDims;
uniform vec4 reflectionModulationTexDims;
uniform vec4 rimColorTexDims;
uniform vec4 materialParamsTexDims;
uniform sc_LightEstimationData_t sc_LightEstimationData;
uniform vec3 sc_EnvmapRotation;
uniform vec4 sc_EnvmapSpecularSize;
uniform vec4 sc_EnvmapDiffuseSize;
uniform float sc_EnvmapExposure;
uniform vec3 sc_Sh[9];
uniform float sc_ShIntensity;
uniform sc_AmbientLight_t sc_AmbientLights[sc_AmbientLightsCount+1];
uniform sc_DirectionalLight_t sc_DirectionalLights[sc_DirectionalLightsCount+1];
uniform sc_PointLight_t sc_PointLights[sc_PointLightsCount+1];
uniform mat3 baseTexTransform;
uniform vec4 baseTexUvMinMax;
uniform vec4 baseTexBorderColor;
uniform mat3 opacityTexTransform;
uniform vec4 opacityTexUvMinMax;
uniform vec4 opacityTexBorderColor;
uniform mat3 normalTexTransform;
uniform vec4 normalTexUvMinMax;
uniform vec4 normalTexBorderColor;
uniform mat3 detailNormalTexTransform;
uniform vec4 detailNormalTexUvMinMax;
uniform vec4 detailNormalTexBorderColor;
uniform mat3 emissiveTexTransform;
uniform vec4 emissiveTexUvMinMax;
uniform vec4 emissiveTexBorderColor;
uniform mat3 reflectionTexTransform;
uniform vec4 reflectionTexUvMinMax;
uniform vec4 reflectionTexBorderColor;
uniform mat3 reflectionModulationTexTransform;
uniform vec4 reflectionModulationTexUvMinMax;
uniform vec4 reflectionModulationTexBorderColor;
uniform mat3 rimColorTexTransform;
uniform vec4 rimColorTexUvMinMax;
uniform vec4 rimColorTexBorderColor;
uniform mat3 materialParamsTexTransform;
uniform vec4 materialParamsTexUvMinMax;
uniform vec4 materialParamsTexBorderColor;
uniform vec4 baseColor;
uniform vec3 recolorRed;
uniform vec3 recolorGreen;
uniform vec3 recolorBlue;
uniform vec3 emissiveColor;
uniform float emissiveIntensity;
uniform float reflectionIntensity;
uniform vec3 rimColor;
uniform float rimIntensity;
uniform float rimExponent;
uniform float metallic;
uniform float roughness;
uniform float specularAoIntensity;
uniform float specularAoDarkening;
uniform vec2 uv2Scale;
uniform vec2 uv2Offset;
uniform vec2 uv3Scale;
uniform vec2 uv3Offset;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform float overrideTimeDelta;
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
uniform float _sc_GetFramebufferColorInvalidUsageMarker;
uniform float sc_DisableFrustumCullingMarker;
uniform vec4 sc_BoneMatrices[(sc_SkinBonesCount*3)+1];
uniform mat3 sc_SkinBonesNormalMatrices[sc_SkinBonesCount+1];
uniform vec4 weights0;
uniform vec4 weights1;
uniform vec4 weights2;
uniform vec4 sc_StereoClipPlanes[sc_NumStereoViews];
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
uniform vec4 sc_RayTracedReflectionTextureSize;
uniform vec4 sc_RayTracedReflectionTextureView;
uniform vec4 sc_RayTracedShadowTextureSize;
uniform vec4 sc_RayTracedShadowTextureView;
uniform vec4 sc_RayTracedDiffIndTextureSize;
uniform vec4 sc_RayTracedDiffIndTextureView;
uniform vec4 sc_RayTracedAoTextureSize;
uniform vec4 sc_RayTracedAoTextureView;
uniform vec3 OriginNormalizationScaleInv;
uniform int instance_id;
uniform int lray_triangles_last;
uniform bool has_animated_pn;
uniform int emitter_stride;
uniform int proxy_offset_position;
uniform int proxy_offset_normal;
uniform int proxy_offset_tangent;
uniform int proxy_offset_color;
uniform int proxy_offset_texture0;
uniform int proxy_offset_texture1;
uniform int proxy_offset_texture2;
uniform int proxy_offset_texture3;
uniform int proxy_format_position;
uniform int proxy_format_normal;
uniform int proxy_format_tangent;
uniform int proxy_format_color;
uniform int proxy_format_texture0;
uniform int proxy_format_texture1;
uniform int proxy_format_texture2;
uniform int proxy_format_texture3;
uniform vec4 z_rayDirectionsSize;
uniform vec4 z_rayDirectionsView;
uniform float correctedIntensity;
uniform vec4 intensityTextureSize;
uniform vec4 intensityTextureView;
uniform mat3 intensityTextureTransform;
uniform vec4 intensityTextureUvMinMax;
uniform vec4 intensityTextureBorderColor;
uniform float reflBlurWidth;
uniform float reflBlurMinRough;
uniform float reflBlurMaxRough;
uniform int PreviewEnabled;
uniform int PreviewNodeID;
uniform vec4 baseTexSize;
uniform vec4 baseTexView;
uniform vec4 opacityTexSize;
uniform vec4 opacityTexView;
uniform vec4 normalTexSize;
uniform vec4 normalTexView;
uniform vec4 detailNormalTexSize;
uniform vec4 detailNormalTexView;
uniform vec4 emissiveTexSize;
uniform vec4 emissiveTexView;
uniform vec4 reflectionTexSize;
uniform vec4 reflectionTexView;
uniform vec4 reflectionModulationTexSize;
uniform vec4 reflectionModulationTexView;
uniform vec4 rimColorTexSize;
uniform vec4 rimColorTexView;
uniform vec4 materialParamsTexSize;
uniform vec4 materialParamsTexView;
uniform float depthRef;
uniform sampler2D baseTex;
uniform sampler2DArray baseTexArrSC;
uniform sampler2D opacityTex;
uniform sampler2DArray opacityTexArrSC;
uniform sampler2D normalTex;
uniform sampler2DArray normalTexArrSC;
uniform sampler2D detailNormalTex;
uniform sampler2DArray detailNormalTexArrSC;
uniform sampler2D emissiveTex;
uniform sampler2DArray emissiveTexArrSC;
uniform sampler2D reflectionTex;
uniform sampler2DArray reflectionTexArrSC;
uniform sampler2D reflectionModulationTex;
uniform sampler2DArray reflectionModulationTexArrSC;
uniform sampler2D rimColorTex;
uniform sampler2DArray rimColorTexArrSC;
uniform sampler2D materialParamsTex;
uniform sampler2DArray materialParamsTexArrSC;
flat in int varStereoViewID;
in vec2 varShadowTex;
in float varClipDistance;
layout(location=0) out uvec4 position_and_mask;
layout(location=1) out uvec4 normal_and_more;
in vec3 varPos;
in vec3 varNormal;
in vec4 varTangent;
in vec4 varPackedTex;
in vec4 varColor;
in vec4 varScreenPos;
in vec2 varScreenTexturePos;
in float varViewSpaceDepth;
in vec4 PreviewVertexColor;
in float PreviewVertexSaved;
bool N7_EnableUV2;
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
l9_0=varStereoViewID;
}
#endif
return l9_0;
}
vec2 N7_gettransformUV(int pickUV,vec2 scale,vec2 offset,bool animated,bool enabled)
{
vec2 l9_0=tempGlobals.Surface_UVCoord0;
vec2 l9_1;
if (enabled==N7_EnableUV2)
{
vec2 l9_2;
if (pickUV==0)
{
l9_2=tempGlobals.Surface_UVCoord0;
}
else
{
l9_2=l9_0;
}
vec2 l9_3;
if (pickUV==1)
{
l9_3=tempGlobals.Surface_UVCoord1;
}
else
{
l9_3=l9_2;
}
vec2 l9_4;
if (pickUV==2)
{
l9_4=tempGlobals.gScreenCoord;
}
else
{
l9_4=l9_3;
}
l9_1=l9_4;
}
else
{
vec2 l9_5;
if (pickUV==0)
{
l9_5=tempGlobals.Surface_UVCoord0;
}
else
{
l9_5=l9_0;
}
vec2 l9_6;
if (pickUV==1)
{
l9_6=tempGlobals.Surface_UVCoord1;
}
else
{
l9_6=l9_5;
}
vec2 l9_7;
if (pickUV==2)
{
l9_7=tempGlobals.gScreenCoord;
}
else
{
l9_7=l9_6;
}
vec2 l9_8;
if (pickUV==3)
{
l9_8=tempGlobals.N7_TransformedUV2;
}
else
{
l9_8=l9_7;
}
l9_1=l9_8;
}
vec2 l9_9=scale;
vec2 l9_10=l9_1*l9_9;
vec2 l9_11=offset;
vec2 l9_12=l9_10+l9_11;
vec2 l9_13;
if (animated)
{
l9_13=l9_12+(offset*tempGlobals.gTimeElapsed);
}
else
{
l9_13=l9_12;
}
return l9_13;
}
vec2 N7_getUV(int pickUV)
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
vec2 l9_3;
if (pickUV==2)
{
l9_3=tempGlobals.N7_TransformedUV2;
}
else
{
l9_3=l9_2;
}
vec2 l9_4;
if (pickUV==3)
{
l9_4=tempGlobals.N7_TransformedUV3;
}
else
{
l9_4=l9_3;
}
return l9_4;
}
int baseTexGetStereoViewIndex()
{
int l9_0;
#if (baseTexHasSwappedViews)
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
int opacityTexGetStereoViewIndex()
{
int l9_0;
#if (opacityTexHasSwappedViews)
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
int normalTexGetStereoViewIndex()
{
int l9_0;
#if (normalTexHasSwappedViews)
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
int detailNormalTexGetStereoViewIndex()
{
int l9_0;
#if (detailNormalTexHasSwappedViews)
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
int emissiveTexGetStereoViewIndex()
{
int l9_0;
#if (emissiveTexHasSwappedViews)
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
vec3 ssPow(vec3 A,vec3 B)
{
float l9_0;
if (A.x<=0.0)
{
l9_0=0.0;
}
else
{
l9_0=pow(A.x,B.x);
}
float l9_1;
if (A.y<=0.0)
{
l9_1=0.0;
}
else
{
l9_1=pow(A.y,B.y);
}
float l9_2;
if (A.z<=0.0)
{
l9_2=0.0;
}
else
{
l9_2=pow(A.z,B.z);
}
return vec3(l9_0,l9_1,l9_2);
}
int reflectionTexGetStereoViewIndex()
{
int l9_0;
#if (reflectionTexHasSwappedViews)
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
int reflectionModulationTexGetStereoViewIndex()
{
int l9_0;
#if (reflectionModulationTexHasSwappedViews)
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
vec3 N7_vec3srgbToLinear(vec3 color)
{
return vec3(ssPow(color.x,2.2),ssPow(color.y,2.2),ssPow(color.z,2.2));
}
int rimColorTexGetStereoViewIndex()
{
int l9_0;
#if (rimColorTexHasSwappedViews)
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
int materialParamsTexGetStereoViewIndex()
{
int l9_0;
#if (materialParamsTexHasSwappedViews)
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
void main()
{
N7_EnableUV2=false;
#if (sc_DepthOnly)
{
return;
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
vec2 l9_6;
#if (sc_StereoRenderingMode==1)
{
vec3 l9_7=vec3(l9_5,0.0);
l9_7.y=((2.0*l9_5.y)+float(sc_GetStereoViewIndex()))-1.0;
l9_6=l9_7.xy;
}
#else
{
l9_6=l9_5;
}
#endif
vec3 l9_8=normalize(sc_Camera.position-varPos);
tempGlobals=ssGlobals(l9_1,l9_2,0.0,vec2(0.0),vec2(0.0),vec3(0.0),l9_8,varPos,l9_3,l9_4,cross(l9_3,l9_4)*varTangent.w,varPackedTex.xy,varPackedTex.zw,varColor,l9_6,varPos);
N7_EnableUV2=(int(ENABLE_UV2)!=0);
tempGlobals.N7_TransformedUV2=N7_gettransformUV(NODE_13_DROPLIST_ITEM,uv2Scale,uv2Offset,(int(uv2EnableAnimation)!=0),N7_EnableUV2);
tempGlobals.N7_TransformedUV3=N7_gettransformUV(NODE_49_DROPLIST_ITEM,uv3Scale,uv3Offset,(int(uv3EnableAnimation)!=0),(int(ENABLE_UV3)!=0));
vec4 l9_9;
#if (ENABLE_BASE_TEX)
{
vec2 l9_10=N7_getUV(NODE_27_DROPLIST_ITEM);
vec4 l9_11;
#if (baseTexLayout==2)
{
float l9_12=l9_10.x;
sc_SoftwareWrapEarly(l9_12,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x);
float l9_13=l9_12;
float l9_14=l9_10.y;
sc_SoftwareWrapEarly(l9_14,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y);
float l9_15=l9_14;
vec2 l9_16;
float l9_17;
#if (SC_USE_UV_MIN_MAX_baseTex)
{
bool l9_18;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_18=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x==3;
}
#else
{
l9_18=(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0);
}
#endif
float l9_19=l9_13;
float l9_20=1.0;
sc_ClampUV(l9_19,baseTexUvMinMax.x,baseTexUvMinMax.z,l9_18,l9_20);
float l9_21=l9_19;
float l9_22=l9_20;
bool l9_23;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_23=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y==3;
}
#else
{
l9_23=(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0);
}
#endif
float l9_24=l9_15;
float l9_25=l9_22;
sc_ClampUV(l9_24,baseTexUvMinMax.y,baseTexUvMinMax.w,l9_23,l9_25);
l9_17=l9_25;
l9_16=vec2(l9_21,l9_24);
}
#else
{
l9_17=1.0;
l9_16=vec2(l9_13,l9_15);
}
#endif
vec2 l9_26=sc_TransformUV(l9_16,(int(SC_USE_UV_TRANSFORM_baseTex)!=0),baseTexTransform);
float l9_27=l9_26.x;
float l9_28=l9_17;
sc_SoftwareWrapLate(l9_27,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x,(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex)!=0)),l9_28);
float l9_29=l9_26.y;
float l9_30=l9_28;
sc_SoftwareWrapLate(l9_29,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y,(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex)!=0)),l9_30);
float l9_31=l9_30;
vec3 l9_32=sc_SamplingCoordsViewToGlobal(vec2(l9_27,l9_29),baseTexLayout,baseTexGetStereoViewIndex());
vec4 l9_33=texture(baseTexArrSC,l9_32,0.0);
vec4 l9_34;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_34=mix(baseTexBorderColor,l9_33,vec4(l9_31));
}
#else
{
l9_34=l9_33;
}
#endif
l9_11=l9_34;
}
#else
{
float l9_35=l9_10.x;
sc_SoftwareWrapEarly(l9_35,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x);
float l9_36=l9_35;
float l9_37=l9_10.y;
sc_SoftwareWrapEarly(l9_37,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y);
float l9_38=l9_37;
vec2 l9_39;
float l9_40;
#if (SC_USE_UV_MIN_MAX_baseTex)
{
bool l9_41;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_41=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x==3;
}
#else
{
l9_41=(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0);
}
#endif
float l9_42=l9_36;
float l9_43=1.0;
sc_ClampUV(l9_42,baseTexUvMinMax.x,baseTexUvMinMax.z,l9_41,l9_43);
float l9_44=l9_42;
float l9_45=l9_43;
bool l9_46;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_46=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y==3;
}
#else
{
l9_46=(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0);
}
#endif
float l9_47=l9_38;
float l9_48=l9_45;
sc_ClampUV(l9_47,baseTexUvMinMax.y,baseTexUvMinMax.w,l9_46,l9_48);
l9_40=l9_48;
l9_39=vec2(l9_44,l9_47);
}
#else
{
l9_40=1.0;
l9_39=vec2(l9_36,l9_38);
}
#endif
vec2 l9_49=sc_TransformUV(l9_39,(int(SC_USE_UV_TRANSFORM_baseTex)!=0),baseTexTransform);
float l9_50=l9_49.x;
float l9_51=l9_40;
sc_SoftwareWrapLate(l9_50,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x,(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex)!=0)),l9_51);
float l9_52=l9_49.y;
float l9_53=l9_51;
sc_SoftwareWrapLate(l9_52,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y,(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex)!=0)),l9_53);
float l9_54=l9_53;
vec3 l9_55=sc_SamplingCoordsViewToGlobal(vec2(l9_50,l9_52),baseTexLayout,baseTexGetStereoViewIndex());
vec4 l9_56=texture(baseTex,l9_55.xy,0.0);
vec4 l9_57;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_57=mix(baseTexBorderColor,l9_56,vec4(l9_54));
}
#else
{
l9_57=l9_56;
}
#endif
l9_11=l9_57;
}
#endif
l9_9=baseColor*l9_11;
}
#else
{
l9_9=baseColor;
}
#endif
vec4 l9_58;
#if (ENABLE_RECOLOR)
{
l9_58=vec4(vec3(0.0).x,vec3(0.0).y,vec3(0.0).z,l9_9.w);
}
#else
{
l9_58=l9_9;
}
#endif
float l9_59;
#if (ENABLE_OPACITY_TEX)
{
vec2 l9_60=N7_getUV(NODE_69_DROPLIST_ITEM);
vec4 l9_61;
#if (opacityTexLayout==2)
{
float l9_62=l9_60.x;
sc_SoftwareWrapEarly(l9_62,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x);
float l9_63=l9_62;
float l9_64=l9_60.y;
sc_SoftwareWrapEarly(l9_64,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y);
float l9_65=l9_64;
vec2 l9_66;
float l9_67;
#if (SC_USE_UV_MIN_MAX_opacityTex)
{
bool l9_68;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_68=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x==3;
}
#else
{
l9_68=(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0);
}
#endif
float l9_69=l9_63;
float l9_70=1.0;
sc_ClampUV(l9_69,opacityTexUvMinMax.x,opacityTexUvMinMax.z,l9_68,l9_70);
float l9_71=l9_69;
float l9_72=l9_70;
bool l9_73;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_73=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y==3;
}
#else
{
l9_73=(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0);
}
#endif
float l9_74=l9_65;
float l9_75=l9_72;
sc_ClampUV(l9_74,opacityTexUvMinMax.y,opacityTexUvMinMax.w,l9_73,l9_75);
l9_67=l9_75;
l9_66=vec2(l9_71,l9_74);
}
#else
{
l9_67=1.0;
l9_66=vec2(l9_63,l9_65);
}
#endif
vec2 l9_76=sc_TransformUV(l9_66,(int(SC_USE_UV_TRANSFORM_opacityTex)!=0),opacityTexTransform);
float l9_77=l9_76.x;
float l9_78=l9_67;
sc_SoftwareWrapLate(l9_77,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x,(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTex)!=0)),l9_78);
float l9_79=l9_76.y;
float l9_80=l9_78;
sc_SoftwareWrapLate(l9_79,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y,(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTex)!=0)),l9_80);
float l9_81=l9_80;
vec3 l9_82=sc_SamplingCoordsViewToGlobal(vec2(l9_77,l9_79),opacityTexLayout,opacityTexGetStereoViewIndex());
vec4 l9_83=texture(opacityTexArrSC,l9_82,0.0);
vec4 l9_84;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_84=mix(opacityTexBorderColor,l9_83,vec4(l9_81));
}
#else
{
l9_84=l9_83;
}
#endif
l9_61=l9_84;
}
#else
{
float l9_85=l9_60.x;
sc_SoftwareWrapEarly(l9_85,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x);
float l9_86=l9_85;
float l9_87=l9_60.y;
sc_SoftwareWrapEarly(l9_87,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y);
float l9_88=l9_87;
vec2 l9_89;
float l9_90;
#if (SC_USE_UV_MIN_MAX_opacityTex)
{
bool l9_91;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_91=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x==3;
}
#else
{
l9_91=(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0);
}
#endif
float l9_92=l9_86;
float l9_93=1.0;
sc_ClampUV(l9_92,opacityTexUvMinMax.x,opacityTexUvMinMax.z,l9_91,l9_93);
float l9_94=l9_92;
float l9_95=l9_93;
bool l9_96;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_96=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y==3;
}
#else
{
l9_96=(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0);
}
#endif
float l9_97=l9_88;
float l9_98=l9_95;
sc_ClampUV(l9_97,opacityTexUvMinMax.y,opacityTexUvMinMax.w,l9_96,l9_98);
l9_90=l9_98;
l9_89=vec2(l9_94,l9_97);
}
#else
{
l9_90=1.0;
l9_89=vec2(l9_86,l9_88);
}
#endif
vec2 l9_99=sc_TransformUV(l9_89,(int(SC_USE_UV_TRANSFORM_opacityTex)!=0),opacityTexTransform);
float l9_100=l9_99.x;
float l9_101=l9_90;
sc_SoftwareWrapLate(l9_100,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x,(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTex)!=0)),l9_101);
float l9_102=l9_99.y;
float l9_103=l9_101;
sc_SoftwareWrapLate(l9_102,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y,(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTex)!=0)),l9_103);
float l9_104=l9_103;
vec3 l9_105=sc_SamplingCoordsViewToGlobal(vec2(l9_100,l9_102),opacityTexLayout,opacityTexGetStereoViewIndex());
vec4 l9_106=texture(opacityTex,l9_105.xy,0.0);
vec4 l9_107;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_107=mix(opacityTexBorderColor,l9_106,vec4(l9_104));
}
#else
{
l9_107=l9_106;
}
#endif
l9_61=l9_107;
}
#endif
l9_59=l9_61.x;
}
#else
{
l9_59=1.0;
}
#endif
float l9_108=l9_59*l9_58.w;
float l9_109;
#if (NODE_38_DROPLIST_ITEM==1)
{
l9_109=l9_108*tempGlobals.VertexColor.w;
}
#else
{
l9_109=l9_108;
}
#endif
vec3 l9_110;
#if (ENABLE_NORMALMAP)
{
vec2 l9_111=N7_getUV(NODE_181_DROPLIST_ITEM);
vec4 l9_112;
#if (normalTexLayout==2)
{
float l9_113=l9_111.x;
sc_SoftwareWrapEarly(l9_113,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x);
float l9_114=l9_113;
float l9_115=l9_111.y;
sc_SoftwareWrapEarly(l9_115,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y);
float l9_116=l9_115;
vec2 l9_117;
float l9_118;
#if (SC_USE_UV_MIN_MAX_normalTex)
{
bool l9_119;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_119=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x==3;
}
#else
{
l9_119=(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0);
}
#endif
float l9_120=l9_114;
float l9_121=1.0;
sc_ClampUV(l9_120,normalTexUvMinMax.x,normalTexUvMinMax.z,l9_119,l9_121);
float l9_122=l9_120;
float l9_123=l9_121;
bool l9_124;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_124=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y==3;
}
#else
{
l9_124=(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0);
}
#endif
float l9_125=l9_116;
float l9_126=l9_123;
sc_ClampUV(l9_125,normalTexUvMinMax.y,normalTexUvMinMax.w,l9_124,l9_126);
l9_118=l9_126;
l9_117=vec2(l9_122,l9_125);
}
#else
{
l9_118=1.0;
l9_117=vec2(l9_114,l9_116);
}
#endif
vec2 l9_127=sc_TransformUV(l9_117,(int(SC_USE_UV_TRANSFORM_normalTex)!=0),normalTexTransform);
float l9_128=l9_127.x;
float l9_129=l9_118;
sc_SoftwareWrapLate(l9_128,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x,(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTex)!=0)),l9_129);
float l9_130=l9_127.y;
float l9_131=l9_129;
sc_SoftwareWrapLate(l9_130,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y,(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTex)!=0)),l9_131);
float l9_132=l9_131;
vec3 l9_133=sc_SamplingCoordsViewToGlobal(vec2(l9_128,l9_130),normalTexLayout,normalTexGetStereoViewIndex());
vec4 l9_134=texture(normalTexArrSC,l9_133,0.0);
vec4 l9_135;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_135=mix(normalTexBorderColor,l9_134,vec4(l9_132));
}
#else
{
l9_135=l9_134;
}
#endif
l9_112=l9_135;
}
#else
{
float l9_136=l9_111.x;
sc_SoftwareWrapEarly(l9_136,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x);
float l9_137=l9_136;
float l9_138=l9_111.y;
sc_SoftwareWrapEarly(l9_138,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y);
float l9_139=l9_138;
vec2 l9_140;
float l9_141;
#if (SC_USE_UV_MIN_MAX_normalTex)
{
bool l9_142;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_142=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x==3;
}
#else
{
l9_142=(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0);
}
#endif
float l9_143=l9_137;
float l9_144=1.0;
sc_ClampUV(l9_143,normalTexUvMinMax.x,normalTexUvMinMax.z,l9_142,l9_144);
float l9_145=l9_143;
float l9_146=l9_144;
bool l9_147;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_147=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y==3;
}
#else
{
l9_147=(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0);
}
#endif
float l9_148=l9_139;
float l9_149=l9_146;
sc_ClampUV(l9_148,normalTexUvMinMax.y,normalTexUvMinMax.w,l9_147,l9_149);
l9_141=l9_149;
l9_140=vec2(l9_145,l9_148);
}
#else
{
l9_141=1.0;
l9_140=vec2(l9_137,l9_139);
}
#endif
vec2 l9_150=sc_TransformUV(l9_140,(int(SC_USE_UV_TRANSFORM_normalTex)!=0),normalTexTransform);
float l9_151=l9_150.x;
float l9_152=l9_141;
sc_SoftwareWrapLate(l9_151,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x,(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTex)!=0)),l9_152);
float l9_153=l9_150.y;
float l9_154=l9_152;
sc_SoftwareWrapLate(l9_153,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y,(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTex)!=0)),l9_154);
float l9_155=l9_154;
vec3 l9_156=sc_SamplingCoordsViewToGlobal(vec2(l9_151,l9_153),normalTexLayout,normalTexGetStereoViewIndex());
vec4 l9_157=texture(normalTex,l9_156.xy,0.0);
vec4 l9_158;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_158=mix(normalTexBorderColor,l9_157,vec4(l9_155));
}
#else
{
l9_158=l9_157;
}
#endif
l9_112=l9_158;
}
#endif
vec3 l9_159;
#if (ENABLE_DETAIL_NORMAL)
{
vec2 l9_160=N7_getUV(NODE_184_DROPLIST_ITEM);
vec4 l9_161;
#if (detailNormalTexLayout==2)
{
float l9_162=l9_160.x;
sc_SoftwareWrapEarly(l9_162,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x);
float l9_163=l9_162;
float l9_164=l9_160.y;
sc_SoftwareWrapEarly(l9_164,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y);
float l9_165=l9_164;
vec2 l9_166;
float l9_167;
#if (SC_USE_UV_MIN_MAX_detailNormalTex)
{
bool l9_168;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_168=ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x==3;
}
#else
{
l9_168=(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0);
}
#endif
float l9_169=l9_163;
float l9_170=1.0;
sc_ClampUV(l9_169,detailNormalTexUvMinMax.x,detailNormalTexUvMinMax.z,l9_168,l9_170);
float l9_171=l9_169;
float l9_172=l9_170;
bool l9_173;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_173=ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y==3;
}
#else
{
l9_173=(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0);
}
#endif
float l9_174=l9_165;
float l9_175=l9_172;
sc_ClampUV(l9_174,detailNormalTexUvMinMax.y,detailNormalTexUvMinMax.w,l9_173,l9_175);
l9_167=l9_175;
l9_166=vec2(l9_171,l9_174);
}
#else
{
l9_167=1.0;
l9_166=vec2(l9_163,l9_165);
}
#endif
vec2 l9_176=sc_TransformUV(l9_166,(int(SC_USE_UV_TRANSFORM_detailNormalTex)!=0),detailNormalTexTransform);
float l9_177=l9_176.x;
float l9_178=l9_167;
sc_SoftwareWrapLate(l9_177,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x,(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_detailNormalTex)!=0)),l9_178);
float l9_179=l9_176.y;
float l9_180=l9_178;
sc_SoftwareWrapLate(l9_179,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y,(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_detailNormalTex)!=0)),l9_180);
float l9_181=l9_180;
vec3 l9_182=sc_SamplingCoordsViewToGlobal(vec2(l9_177,l9_179),detailNormalTexLayout,detailNormalTexGetStereoViewIndex());
vec4 l9_183=texture(detailNormalTexArrSC,l9_182,0.0);
vec4 l9_184;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_184=mix(detailNormalTexBorderColor,l9_183,vec4(l9_181));
}
#else
{
l9_184=l9_183;
}
#endif
l9_161=l9_184;
}
#else
{
float l9_185=l9_160.x;
sc_SoftwareWrapEarly(l9_185,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x);
float l9_186=l9_185;
float l9_187=l9_160.y;
sc_SoftwareWrapEarly(l9_187,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y);
float l9_188=l9_187;
vec2 l9_189;
float l9_190;
#if (SC_USE_UV_MIN_MAX_detailNormalTex)
{
bool l9_191;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_191=ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x==3;
}
#else
{
l9_191=(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0);
}
#endif
float l9_192=l9_186;
float l9_193=1.0;
sc_ClampUV(l9_192,detailNormalTexUvMinMax.x,detailNormalTexUvMinMax.z,l9_191,l9_193);
float l9_194=l9_192;
float l9_195=l9_193;
bool l9_196;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_196=ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y==3;
}
#else
{
l9_196=(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0);
}
#endif
float l9_197=l9_188;
float l9_198=l9_195;
sc_ClampUV(l9_197,detailNormalTexUvMinMax.y,detailNormalTexUvMinMax.w,l9_196,l9_198);
l9_190=l9_198;
l9_189=vec2(l9_194,l9_197);
}
#else
{
l9_190=1.0;
l9_189=vec2(l9_186,l9_188);
}
#endif
vec2 l9_199=sc_TransformUV(l9_189,(int(SC_USE_UV_TRANSFORM_detailNormalTex)!=0),detailNormalTexTransform);
float l9_200=l9_199.x;
float l9_201=l9_190;
sc_SoftwareWrapLate(l9_200,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x,(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_detailNormalTex)!=0)),l9_201);
float l9_202=l9_199.y;
float l9_203=l9_201;
sc_SoftwareWrapLate(l9_202,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y,(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_detailNormalTex)!=0)),l9_203);
float l9_204=l9_203;
vec3 l9_205=sc_SamplingCoordsViewToGlobal(vec2(l9_200,l9_202),detailNormalTexLayout,detailNormalTexGetStereoViewIndex());
vec4 l9_206=texture(detailNormalTex,l9_205.xy,0.0);
vec4 l9_207;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_207=mix(detailNormalTexBorderColor,l9_206,vec4(l9_204));
}
#else
{
l9_207=l9_206;
}
#endif
l9_161=l9_207;
}
#endif
l9_159=(l9_161.xyz*1.9921875)-vec3(1.0);
}
#else
{
l9_159=vec3(0.0,0.0,1.0);
}
#endif
vec3 l9_208=((l9_112.xyz*1.9921875)-vec3(1.0))+vec3(0.0,0.0,1.0);
vec3 l9_209=l9_159*vec3(-1.0,-1.0,1.0);
l9_110=normalize(mat3(tempGlobals.VertexTangent_WorldSpace,tempGlobals.VertexBinormal_WorldSpace,tempGlobals.VertexNormal_WorldSpace)*normalize((l9_208*dot(l9_208,l9_209))-(l9_209*l9_208.z)));
}
#else
{
l9_110=normalize(tempGlobals.VertexNormal_WorldSpace);
}
#endif
vec3 l9_210;
#if (ENABLE_EMISSIVE)
{
vec2 l9_211=N7_getUV(NODE_76_DROPLIST_ITEM);
vec4 l9_212;
#if (emissiveTexLayout==2)
{
float l9_213=l9_211.x;
sc_SoftwareWrapEarly(l9_213,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x);
float l9_214=l9_213;
float l9_215=l9_211.y;
sc_SoftwareWrapEarly(l9_215,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y);
float l9_216=l9_215;
vec2 l9_217;
float l9_218;
#if (SC_USE_UV_MIN_MAX_emissiveTex)
{
bool l9_219;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_219=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x==3;
}
#else
{
l9_219=(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0);
}
#endif
float l9_220=l9_214;
float l9_221=1.0;
sc_ClampUV(l9_220,emissiveTexUvMinMax.x,emissiveTexUvMinMax.z,l9_219,l9_221);
float l9_222=l9_220;
float l9_223=l9_221;
bool l9_224;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_224=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y==3;
}
#else
{
l9_224=(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0);
}
#endif
float l9_225=l9_216;
float l9_226=l9_223;
sc_ClampUV(l9_225,emissiveTexUvMinMax.y,emissiveTexUvMinMax.w,l9_224,l9_226);
l9_218=l9_226;
l9_217=vec2(l9_222,l9_225);
}
#else
{
l9_218=1.0;
l9_217=vec2(l9_214,l9_216);
}
#endif
vec2 l9_227=sc_TransformUV(l9_217,(int(SC_USE_UV_TRANSFORM_emissiveTex)!=0),emissiveTexTransform);
float l9_228=l9_227.x;
float l9_229=l9_218;
sc_SoftwareWrapLate(l9_228,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x,(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTex)!=0)),l9_229);
float l9_230=l9_227.y;
float l9_231=l9_229;
sc_SoftwareWrapLate(l9_230,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y,(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTex)!=0)),l9_231);
float l9_232=l9_231;
vec3 l9_233=sc_SamplingCoordsViewToGlobal(vec2(l9_228,l9_230),emissiveTexLayout,emissiveTexGetStereoViewIndex());
vec4 l9_234=texture(emissiveTexArrSC,l9_233,0.0);
vec4 l9_235;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_235=mix(emissiveTexBorderColor,l9_234,vec4(l9_232));
}
#else
{
l9_235=l9_234;
}
#endif
l9_212=l9_235;
}
#else
{
float l9_236=l9_211.x;
sc_SoftwareWrapEarly(l9_236,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x);
float l9_237=l9_236;
float l9_238=l9_211.y;
sc_SoftwareWrapEarly(l9_238,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y);
float l9_239=l9_238;
vec2 l9_240;
float l9_241;
#if (SC_USE_UV_MIN_MAX_emissiveTex)
{
bool l9_242;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_242=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x==3;
}
#else
{
l9_242=(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0);
}
#endif
float l9_243=l9_237;
float l9_244=1.0;
sc_ClampUV(l9_243,emissiveTexUvMinMax.x,emissiveTexUvMinMax.z,l9_242,l9_244);
float l9_245=l9_243;
float l9_246=l9_244;
bool l9_247;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_247=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y==3;
}
#else
{
l9_247=(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0);
}
#endif
float l9_248=l9_239;
float l9_249=l9_246;
sc_ClampUV(l9_248,emissiveTexUvMinMax.y,emissiveTexUvMinMax.w,l9_247,l9_249);
l9_241=l9_249;
l9_240=vec2(l9_245,l9_248);
}
#else
{
l9_241=1.0;
l9_240=vec2(l9_237,l9_239);
}
#endif
vec2 l9_250=sc_TransformUV(l9_240,(int(SC_USE_UV_TRANSFORM_emissiveTex)!=0),emissiveTexTransform);
float l9_251=l9_250.x;
float l9_252=l9_241;
sc_SoftwareWrapLate(l9_251,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x,(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTex)!=0)),l9_252);
float l9_253=l9_250.y;
float l9_254=l9_252;
sc_SoftwareWrapLate(l9_253,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y,(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTex)!=0)),l9_254);
float l9_255=l9_254;
vec3 l9_256=sc_SamplingCoordsViewToGlobal(vec2(l9_251,l9_253),emissiveTexLayout,emissiveTexGetStereoViewIndex());
vec4 l9_257=texture(emissiveTex,l9_256.xy,0.0);
vec4 l9_258;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_258=mix(emissiveTexBorderColor,l9_257,vec4(l9_255));
}
#else
{
l9_258=l9_257;
}
#endif
l9_212=l9_258;
}
#endif
l9_210=l9_212.xyz;
}
#else
{
l9_210=vec3(0.0);
}
#endif
vec3 l9_259;
#if (NODE_38_DROPLIST_ITEM==2)
{
l9_259=l9_210+tempGlobals.VertexColor.xyz;
}
#else
{
l9_259=l9_210;
}
#endif
vec3 l9_260;
#if ((NODE_38_DROPLIST_ITEM==2)||ENABLE_EMISSIVE)
{
l9_260=ssPow((l9_259*emissiveColor)*vec3(emissiveIntensity),vec3(2.2));
}
#else
{
l9_260=l9_259;
}
#endif
vec3 l9_261;
#if (ENABLE_SIMPLE_REFLECTION)
{
vec3 l9_262=tempGlobals.ViewDirWS;
vec3 l9_263=reflect(l9_262,l9_110);
float l9_264=l9_263.x;
float l9_265=l9_263.y;
float l9_266=(-l9_263.z)+1.0;
float l9_267=((l9_264*l9_264)+(l9_265*l9_265))+(l9_266*l9_266);
float l9_268;
if (l9_267<=0.0)
{
l9_268=0.0;
}
else
{
l9_268=sqrt(l9_267);
}
float l9_269=2.0*l9_268;
vec2 l9_270=vec2(1.0)-((l9_263.xy/vec2(l9_269))+vec2(0.5));
vec4 l9_271;
#if (reflectionTexLayout==2)
{
float l9_272=l9_270.x;
sc_SoftwareWrapEarly(l9_272,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x);
float l9_273=l9_272;
float l9_274=l9_270.y;
sc_SoftwareWrapEarly(l9_274,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y);
float l9_275=l9_274;
vec2 l9_276;
float l9_277;
#if (SC_USE_UV_MIN_MAX_reflectionTex)
{
bool l9_278;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_278=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x==3;
}
#else
{
l9_278=(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0);
}
#endif
float l9_279=l9_273;
float l9_280=1.0;
sc_ClampUV(l9_279,reflectionTexUvMinMax.x,reflectionTexUvMinMax.z,l9_278,l9_280);
float l9_281=l9_279;
float l9_282=l9_280;
bool l9_283;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_283=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y==3;
}
#else
{
l9_283=(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0);
}
#endif
float l9_284=l9_275;
float l9_285=l9_282;
sc_ClampUV(l9_284,reflectionTexUvMinMax.y,reflectionTexUvMinMax.w,l9_283,l9_285);
l9_277=l9_285;
l9_276=vec2(l9_281,l9_284);
}
#else
{
l9_277=1.0;
l9_276=vec2(l9_273,l9_275);
}
#endif
vec2 l9_286=sc_TransformUV(l9_276,(int(SC_USE_UV_TRANSFORM_reflectionTex)!=0),reflectionTexTransform);
float l9_287=l9_286.x;
float l9_288=l9_277;
sc_SoftwareWrapLate(l9_287,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x,(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionTex)!=0)),l9_288);
float l9_289=l9_286.y;
float l9_290=l9_288;
sc_SoftwareWrapLate(l9_289,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y,(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionTex)!=0)),l9_290);
float l9_291=l9_290;
vec3 l9_292=sc_SamplingCoordsViewToGlobal(vec2(l9_287,l9_289),reflectionTexLayout,reflectionTexGetStereoViewIndex());
vec4 l9_293=texture(reflectionTexArrSC,l9_292,0.0);
vec4 l9_294;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_294=mix(reflectionTexBorderColor,l9_293,vec4(l9_291));
}
#else
{
l9_294=l9_293;
}
#endif
l9_271=l9_294;
}
#else
{
float l9_295=l9_270.x;
sc_SoftwareWrapEarly(l9_295,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x);
float l9_296=l9_295;
float l9_297=l9_270.y;
sc_SoftwareWrapEarly(l9_297,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y);
float l9_298=l9_297;
vec2 l9_299;
float l9_300;
#if (SC_USE_UV_MIN_MAX_reflectionTex)
{
bool l9_301;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_301=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x==3;
}
#else
{
l9_301=(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0);
}
#endif
float l9_302=l9_296;
float l9_303=1.0;
sc_ClampUV(l9_302,reflectionTexUvMinMax.x,reflectionTexUvMinMax.z,l9_301,l9_303);
float l9_304=l9_302;
float l9_305=l9_303;
bool l9_306;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_306=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y==3;
}
#else
{
l9_306=(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0);
}
#endif
float l9_307=l9_298;
float l9_308=l9_305;
sc_ClampUV(l9_307,reflectionTexUvMinMax.y,reflectionTexUvMinMax.w,l9_306,l9_308);
l9_300=l9_308;
l9_299=vec2(l9_304,l9_307);
}
#else
{
l9_300=1.0;
l9_299=vec2(l9_296,l9_298);
}
#endif
vec2 l9_309=sc_TransformUV(l9_299,(int(SC_USE_UV_TRANSFORM_reflectionTex)!=0),reflectionTexTransform);
float l9_310=l9_309.x;
float l9_311=l9_300;
sc_SoftwareWrapLate(l9_310,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x,(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionTex)!=0)),l9_311);
float l9_312=l9_309.y;
float l9_313=l9_311;
sc_SoftwareWrapLate(l9_312,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y,(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionTex)!=0)),l9_313);
float l9_314=l9_313;
vec3 l9_315=sc_SamplingCoordsViewToGlobal(vec2(l9_310,l9_312),reflectionTexLayout,reflectionTexGetStereoViewIndex());
vec4 l9_316=texture(reflectionTex,l9_315.xy,0.0);
vec4 l9_317;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_317=mix(reflectionTexBorderColor,l9_316,vec4(l9_314));
}
#else
{
l9_317=l9_316;
}
#endif
l9_271=l9_317;
}
#endif
vec3 l9_318;
#if (Tweak_N177)
{
vec2 l9_319=N7_getUV(NODE_228_DROPLIST_ITEM);
vec4 l9_320;
#if (reflectionModulationTexLayout==2)
{
float l9_321=l9_319.x;
sc_SoftwareWrapEarly(l9_321,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x);
float l9_322=l9_321;
float l9_323=l9_319.y;
sc_SoftwareWrapEarly(l9_323,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y);
float l9_324=l9_323;
vec2 l9_325;
float l9_326;
#if (SC_USE_UV_MIN_MAX_reflectionModulationTex)
{
bool l9_327;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_327=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x==3;
}
#else
{
l9_327=(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0);
}
#endif
float l9_328=l9_322;
float l9_329=1.0;
sc_ClampUV(l9_328,reflectionModulationTexUvMinMax.x,reflectionModulationTexUvMinMax.z,l9_327,l9_329);
float l9_330=l9_328;
float l9_331=l9_329;
bool l9_332;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_332=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y==3;
}
#else
{
l9_332=(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0);
}
#endif
float l9_333=l9_324;
float l9_334=l9_331;
sc_ClampUV(l9_333,reflectionModulationTexUvMinMax.y,reflectionModulationTexUvMinMax.w,l9_332,l9_334);
l9_326=l9_334;
l9_325=vec2(l9_330,l9_333);
}
#else
{
l9_326=1.0;
l9_325=vec2(l9_322,l9_324);
}
#endif
vec2 l9_335=sc_TransformUV(l9_325,(int(SC_USE_UV_TRANSFORM_reflectionModulationTex)!=0),reflectionModulationTexTransform);
float l9_336=l9_335.x;
float l9_337=l9_326;
sc_SoftwareWrapLate(l9_336,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x,(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionModulationTex)!=0)),l9_337);
float l9_338=l9_335.y;
float l9_339=l9_337;
sc_SoftwareWrapLate(l9_338,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y,(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionModulationTex)!=0)),l9_339);
float l9_340=l9_339;
vec3 l9_341=sc_SamplingCoordsViewToGlobal(vec2(l9_336,l9_338),reflectionModulationTexLayout,reflectionModulationTexGetStereoViewIndex());
vec4 l9_342=texture(reflectionModulationTexArrSC,l9_341,0.0);
vec4 l9_343;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_343=mix(reflectionModulationTexBorderColor,l9_342,vec4(l9_340));
}
#else
{
l9_343=l9_342;
}
#endif
l9_320=l9_343;
}
#else
{
float l9_344=l9_319.x;
sc_SoftwareWrapEarly(l9_344,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x);
float l9_345=l9_344;
float l9_346=l9_319.y;
sc_SoftwareWrapEarly(l9_346,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y);
float l9_347=l9_346;
vec2 l9_348;
float l9_349;
#if (SC_USE_UV_MIN_MAX_reflectionModulationTex)
{
bool l9_350;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_350=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x==3;
}
#else
{
l9_350=(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0);
}
#endif
float l9_351=l9_345;
float l9_352=1.0;
sc_ClampUV(l9_351,reflectionModulationTexUvMinMax.x,reflectionModulationTexUvMinMax.z,l9_350,l9_352);
float l9_353=l9_351;
float l9_354=l9_352;
bool l9_355;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_355=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y==3;
}
#else
{
l9_355=(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0);
}
#endif
float l9_356=l9_347;
float l9_357=l9_354;
sc_ClampUV(l9_356,reflectionModulationTexUvMinMax.y,reflectionModulationTexUvMinMax.w,l9_355,l9_357);
l9_349=l9_357;
l9_348=vec2(l9_353,l9_356);
}
#else
{
l9_349=1.0;
l9_348=vec2(l9_345,l9_347);
}
#endif
vec2 l9_358=sc_TransformUV(l9_348,(int(SC_USE_UV_TRANSFORM_reflectionModulationTex)!=0),reflectionModulationTexTransform);
float l9_359=l9_358.x;
float l9_360=l9_349;
sc_SoftwareWrapLate(l9_359,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x,(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionModulationTex)!=0)),l9_360);
float l9_361=l9_358.y;
float l9_362=l9_360;
sc_SoftwareWrapLate(l9_361,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y,(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionModulationTex)!=0)),l9_362);
float l9_363=l9_362;
vec3 l9_364=sc_SamplingCoordsViewToGlobal(vec2(l9_359,l9_361),reflectionModulationTexLayout,reflectionModulationTexGetStereoViewIndex());
vec4 l9_365=texture(reflectionModulationTex,l9_364.xy,0.0);
vec4 l9_366;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_366=mix(reflectionModulationTexBorderColor,l9_365,vec4(l9_363));
}
#else
{
l9_366=l9_365;
}
#endif
l9_320=l9_366;
}
#endif
l9_318=l9_271.xyz*l9_320.xyz;
}
#else
{
l9_318=l9_271.xyz;
}
#endif
l9_261=N7_vec3srgbToLinear(l9_318)*reflectionIntensity;
}
#else
{
l9_261=vec3(0.0);
}
#endif
vec3 l9_367;
#if (ENABLE_RIM_HIGHLIGHT)
{
vec3 l9_368=rimColor*rimIntensity;
vec3 l9_369;
#if (Tweak_N216)
{
vec2 l9_370=N7_getUV(NODE_315_DROPLIST_ITEM);
vec4 l9_371;
#if (rimColorTexLayout==2)
{
float l9_372=l9_370.x;
sc_SoftwareWrapEarly(l9_372,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x);
float l9_373=l9_372;
float l9_374=l9_370.y;
sc_SoftwareWrapEarly(l9_374,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y);
float l9_375=l9_374;
vec2 l9_376;
float l9_377;
#if (SC_USE_UV_MIN_MAX_rimColorTex)
{
bool l9_378;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_378=ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x==3;
}
#else
{
l9_378=(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0);
}
#endif
float l9_379=l9_373;
float l9_380=1.0;
sc_ClampUV(l9_379,rimColorTexUvMinMax.x,rimColorTexUvMinMax.z,l9_378,l9_380);
float l9_381=l9_379;
float l9_382=l9_380;
bool l9_383;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_383=ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y==3;
}
#else
{
l9_383=(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0);
}
#endif
float l9_384=l9_375;
float l9_385=l9_382;
sc_ClampUV(l9_384,rimColorTexUvMinMax.y,rimColorTexUvMinMax.w,l9_383,l9_385);
l9_377=l9_385;
l9_376=vec2(l9_381,l9_384);
}
#else
{
l9_377=1.0;
l9_376=vec2(l9_373,l9_375);
}
#endif
vec2 l9_386=sc_TransformUV(l9_376,(int(SC_USE_UV_TRANSFORM_rimColorTex)!=0),rimColorTexTransform);
float l9_387=l9_386.x;
float l9_388=l9_377;
sc_SoftwareWrapLate(l9_387,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x,(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_rimColorTex)!=0)),l9_388);
float l9_389=l9_386.y;
float l9_390=l9_388;
sc_SoftwareWrapLate(l9_389,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y,(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_rimColorTex)!=0)),l9_390);
float l9_391=l9_390;
vec3 l9_392=sc_SamplingCoordsViewToGlobal(vec2(l9_387,l9_389),rimColorTexLayout,rimColorTexGetStereoViewIndex());
vec4 l9_393=texture(rimColorTexArrSC,l9_392,0.0);
vec4 l9_394;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_394=mix(rimColorTexBorderColor,l9_393,vec4(l9_391));
}
#else
{
l9_394=l9_393;
}
#endif
l9_371=l9_394;
}
#else
{
float l9_395=l9_370.x;
sc_SoftwareWrapEarly(l9_395,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x);
float l9_396=l9_395;
float l9_397=l9_370.y;
sc_SoftwareWrapEarly(l9_397,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y);
float l9_398=l9_397;
vec2 l9_399;
float l9_400;
#if (SC_USE_UV_MIN_MAX_rimColorTex)
{
bool l9_401;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_401=ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x==3;
}
#else
{
l9_401=(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0);
}
#endif
float l9_402=l9_396;
float l9_403=1.0;
sc_ClampUV(l9_402,rimColorTexUvMinMax.x,rimColorTexUvMinMax.z,l9_401,l9_403);
float l9_404=l9_402;
float l9_405=l9_403;
bool l9_406;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_406=ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y==3;
}
#else
{
l9_406=(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0);
}
#endif
float l9_407=l9_398;
float l9_408=l9_405;
sc_ClampUV(l9_407,rimColorTexUvMinMax.y,rimColorTexUvMinMax.w,l9_406,l9_408);
l9_400=l9_408;
l9_399=vec2(l9_404,l9_407);
}
#else
{
l9_400=1.0;
l9_399=vec2(l9_396,l9_398);
}
#endif
vec2 l9_409=sc_TransformUV(l9_399,(int(SC_USE_UV_TRANSFORM_rimColorTex)!=0),rimColorTexTransform);
float l9_410=l9_409.x;
float l9_411=l9_400;
sc_SoftwareWrapLate(l9_410,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x,(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_rimColorTex)!=0)),l9_411);
float l9_412=l9_409.y;
float l9_413=l9_411;
sc_SoftwareWrapLate(l9_412,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y,(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_rimColorTex)!=0)),l9_413);
float l9_414=l9_413;
vec3 l9_415=sc_SamplingCoordsViewToGlobal(vec2(l9_410,l9_412),rimColorTexLayout,rimColorTexGetStereoViewIndex());
vec4 l9_416=texture(rimColorTex,l9_415.xy,0.0);
vec4 l9_417;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_417=mix(rimColorTexBorderColor,l9_416,vec4(l9_414));
}
#else
{
l9_417=l9_416;
}
#endif
l9_371=l9_417;
}
#endif
l9_369=l9_368*l9_371.xyz;
}
#else
{
l9_369=l9_368;
}
#endif
vec3 l9_418=tempGlobals.ViewDirWS;
float l9_419=dot(l9_110,l9_418);
float l9_420=abs(l9_419);
float l9_421;
#if (!ENABLE_RIM_INVERT)
{
l9_421=1.0-l9_420;
}
#else
{
l9_421=l9_420;
}
#endif
l9_367=vec3(0.0)+(N7_vec3srgbToLinear(l9_369)*ssPow(l9_421,rimExponent));
}
#else
{
l9_367=vec3(0.0);
}
#endif
vec2 l9_422=N7_getUV(NODE_221_DROPLIST_ITEM);
vec4 l9_423;
#if (materialParamsTexLayout==2)
{
float l9_424=l9_422.x;
sc_SoftwareWrapEarly(l9_424,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x);
float l9_425=l9_424;
float l9_426=l9_422.y;
sc_SoftwareWrapEarly(l9_426,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y);
float l9_427=l9_426;
vec2 l9_428;
float l9_429;
#if (SC_USE_UV_MIN_MAX_materialParamsTex)
{
bool l9_430;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_430=ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x==3;
}
#else
{
l9_430=(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0);
}
#endif
float l9_431=l9_425;
float l9_432=1.0;
sc_ClampUV(l9_431,materialParamsTexUvMinMax.x,materialParamsTexUvMinMax.z,l9_430,l9_432);
float l9_433=l9_431;
float l9_434=l9_432;
bool l9_435;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_435=ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y==3;
}
#else
{
l9_435=(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0);
}
#endif
float l9_436=l9_427;
float l9_437=l9_434;
sc_ClampUV(l9_436,materialParamsTexUvMinMax.y,materialParamsTexUvMinMax.w,l9_435,l9_437);
l9_429=l9_437;
l9_428=vec2(l9_433,l9_436);
}
#else
{
l9_429=1.0;
l9_428=vec2(l9_425,l9_427);
}
#endif
vec2 l9_438=sc_TransformUV(l9_428,(int(SC_USE_UV_TRANSFORM_materialParamsTex)!=0),materialParamsTexTransform);
float l9_439=l9_438.x;
float l9_440=l9_429;
sc_SoftwareWrapLate(l9_439,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x,(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_materialParamsTex)!=0)),l9_440);
float l9_441=l9_438.y;
float l9_442=l9_440;
sc_SoftwareWrapLate(l9_441,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y,(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_materialParamsTex)!=0)),l9_442);
float l9_443=l9_442;
vec3 l9_444=sc_SamplingCoordsViewToGlobal(vec2(l9_439,l9_441),materialParamsTexLayout,materialParamsTexGetStereoViewIndex());
vec4 l9_445=texture(materialParamsTexArrSC,l9_444,0.0);
vec4 l9_446;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_446=mix(materialParamsTexBorderColor,l9_445,vec4(l9_443));
}
#else
{
l9_446=l9_445;
}
#endif
l9_423=l9_446;
}
#else
{
float l9_447=l9_422.x;
sc_SoftwareWrapEarly(l9_447,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x);
float l9_448=l9_447;
float l9_449=l9_422.y;
sc_SoftwareWrapEarly(l9_449,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y);
float l9_450=l9_449;
vec2 l9_451;
float l9_452;
#if (SC_USE_UV_MIN_MAX_materialParamsTex)
{
bool l9_453;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_453=ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x==3;
}
#else
{
l9_453=(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0);
}
#endif
float l9_454=l9_448;
float l9_455=1.0;
sc_ClampUV(l9_454,materialParamsTexUvMinMax.x,materialParamsTexUvMinMax.z,l9_453,l9_455);
float l9_456=l9_454;
float l9_457=l9_455;
bool l9_458;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_458=ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y==3;
}
#else
{
l9_458=(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0);
}
#endif
float l9_459=l9_450;
float l9_460=l9_457;
sc_ClampUV(l9_459,materialParamsTexUvMinMax.y,materialParamsTexUvMinMax.w,l9_458,l9_460);
l9_452=l9_460;
l9_451=vec2(l9_456,l9_459);
}
#else
{
l9_452=1.0;
l9_451=vec2(l9_448,l9_450);
}
#endif
vec2 l9_461=sc_TransformUV(l9_451,(int(SC_USE_UV_TRANSFORM_materialParamsTex)!=0),materialParamsTexTransform);
float l9_462=l9_461.x;
float l9_463=l9_452;
sc_SoftwareWrapLate(l9_462,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x,(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_materialParamsTex)!=0)),l9_463);
float l9_464=l9_461.y;
float l9_465=l9_463;
sc_SoftwareWrapLate(l9_464,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y,(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_materialParamsTex)!=0)),l9_465);
float l9_466=l9_465;
vec3 l9_467=sc_SamplingCoordsViewToGlobal(vec2(l9_462,l9_464),materialParamsTexLayout,materialParamsTexGetStereoViewIndex());
vec4 l9_468=texture(materialParamsTex,l9_467.xy,0.0);
vec4 l9_469;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_469=mix(materialParamsTexBorderColor,l9_468,vec4(l9_466));
}
#else
{
l9_469=l9_468;
}
#endif
l9_423=l9_469;
}
#endif
float l9_470=l9_423.y*roughness;
vec3 l9_471;
#if (!sc_ProjectiveShadowsCaster)
{
l9_471=l9_110;
}
#else
{
l9_471=vec3(0.0);
}
#endif
float l9_472=clamp(l9_109,0.0,1.0);
#if (sc_BlendMode_AlphaTest)
{
if (l9_472<alphaTestThreshold)
{
discard;
}
}
#endif
#if (ENABLE_STIPPLE_PATTERN_TEST)
{
if (l9_472<((mod(dot(floor(mod(gl_FragCoord.xy,vec2(4.0))),vec2(4.0,1.0))*9.0,16.0)+1.0)/17.0))
{
discard;
}
}
#endif
if (dot(l9_8,l9_471)>=(-0.050000001))
{
uvec3 l9_473=uvec3(round((varPos-OriginNormalizationOffset)*OriginNormalizationScale));
position_and_mask=uvec4(l9_473.x,l9_473.y,l9_473.z,position_and_mask.w);
position_and_mask.w=uint(receiver_mask);
vec3 l9_474=abs(l9_471);
vec3 l9_475=l9_471/vec3(dot(l9_474,vec3(1.0)));
float l9_476=clamp(-l9_475.z,0.0,1.0);
float l9_477=l9_475.x;
float l9_478;
if (l9_477>=0.0)
{
l9_478=l9_476;
}
else
{
l9_478=-l9_476;
}
float l9_479=l9_477+l9_478;
float l9_480=l9_475.y;
float l9_481;
if (l9_480>=0.0)
{
l9_481=l9_476;
}
else
{
l9_481=-l9_476;
}
uvec2 l9_482=uvec2(packHalf2x16(vec2(l9_479,0.0)),packHalf2x16(vec2(l9_480+l9_481,0.0)));
normal_and_more=uvec4(l9_482.x,l9_482.y,normal_and_more.z,normal_and_more.w);
normal_and_more.z=packHalf2x16(vec2(0.0));
uint l9_483;
if (l9_470<0.0)
{
l9_483=1023u;
}
else
{
l9_483=uint(clamp(l9_470,0.0,1.0)*1000.0);
}
normal_and_more.w=l9_483|uint((receiverId%32)<<int(10u));
}
else
{
position_and_mask=uvec4(0u);
normal_and_more=uvec4(0u);
}
}
#else // #if SC_RT_RECEIVER_MODE
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
#ifdef uv2
#undef uv2
#endif
#ifdef uv3
#undef uv3
#endif
struct RayHitPayload
{
vec3 viewDirWS;
vec3 positionWS;
vec3 normalWS;
vec4 tangentWS;
vec4 color;
vec2 uv0;
vec2 uv1;
vec2 uv2;
vec2 uv3;
uvec2 id;
};
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
vec2 N7_TransformedUV2;
vec2 N7_TransformedUV3;
vec3 BumpedNormal;
vec3 ViewDirWS;
vec3 PositionWS;
vec3 VertexNormal_WorldSpace;
vec3 VertexTangent_WorldSpace;
vec3 VertexBinormal_WorldSpace;
vec2 Surface_UVCoord0;
vec2 Surface_UVCoord1;
vec4 VertexColor;
vec2 gScreenCoord;
vec3 SurfacePosition_WorldSpace;
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
#ifndef sc_RayTracedReflectionTextureHasSwappedViews
#define sc_RayTracedReflectionTextureHasSwappedViews 0
#elif sc_RayTracedReflectionTextureHasSwappedViews==1
#undef sc_RayTracedReflectionTextureHasSwappedViews
#define sc_RayTracedReflectionTextureHasSwappedViews 1
#endif
#ifndef sc_RayTracedReflectionTextureLayout
#define sc_RayTracedReflectionTextureLayout 0
#endif
#ifndef sc_RayTracedShadowTextureHasSwappedViews
#define sc_RayTracedShadowTextureHasSwappedViews 0
#elif sc_RayTracedShadowTextureHasSwappedViews==1
#undef sc_RayTracedShadowTextureHasSwappedViews
#define sc_RayTracedShadowTextureHasSwappedViews 1
#endif
#ifndef sc_RayTracedShadowTextureLayout
#define sc_RayTracedShadowTextureLayout 0
#endif
#ifndef sc_RayTracedDiffIndTextureHasSwappedViews
#define sc_RayTracedDiffIndTextureHasSwappedViews 0
#elif sc_RayTracedDiffIndTextureHasSwappedViews==1
#undef sc_RayTracedDiffIndTextureHasSwappedViews
#define sc_RayTracedDiffIndTextureHasSwappedViews 1
#endif
#ifndef sc_RayTracedDiffIndTextureLayout
#define sc_RayTracedDiffIndTextureLayout 0
#endif
#ifndef sc_RayTracedAoTextureHasSwappedViews
#define sc_RayTracedAoTextureHasSwappedViews 0
#elif sc_RayTracedAoTextureHasSwappedViews==1
#undef sc_RayTracedAoTextureHasSwappedViews
#define sc_RayTracedAoTextureHasSwappedViews 1
#endif
#ifndef sc_RayTracedAoTextureLayout
#define sc_RayTracedAoTextureLayout 0
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
#ifndef sc_ProxyAlphaOne
#define sc_ProxyAlphaOne 0
#elif sc_ProxyAlphaOne==1
#undef sc_ProxyAlphaOne
#define sc_ProxyAlphaOne 1
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
#ifndef baseTexHasSwappedViews
#define baseTexHasSwappedViews 0
#elif baseTexHasSwappedViews==1
#undef baseTexHasSwappedViews
#define baseTexHasSwappedViews 1
#endif
#ifndef baseTexLayout
#define baseTexLayout 0
#endif
#ifndef opacityTexHasSwappedViews
#define opacityTexHasSwappedViews 0
#elif opacityTexHasSwappedViews==1
#undef opacityTexHasSwappedViews
#define opacityTexHasSwappedViews 1
#endif
#ifndef opacityTexLayout
#define opacityTexLayout 0
#endif
#ifndef normalTexHasSwappedViews
#define normalTexHasSwappedViews 0
#elif normalTexHasSwappedViews==1
#undef normalTexHasSwappedViews
#define normalTexHasSwappedViews 1
#endif
#ifndef normalTexLayout
#define normalTexLayout 0
#endif
#ifndef detailNormalTexHasSwappedViews
#define detailNormalTexHasSwappedViews 0
#elif detailNormalTexHasSwappedViews==1
#undef detailNormalTexHasSwappedViews
#define detailNormalTexHasSwappedViews 1
#endif
#ifndef detailNormalTexLayout
#define detailNormalTexLayout 0
#endif
#ifndef emissiveTexHasSwappedViews
#define emissiveTexHasSwappedViews 0
#elif emissiveTexHasSwappedViews==1
#undef emissiveTexHasSwappedViews
#define emissiveTexHasSwappedViews 1
#endif
#ifndef emissiveTexLayout
#define emissiveTexLayout 0
#endif
#ifndef reflectionTexHasSwappedViews
#define reflectionTexHasSwappedViews 0
#elif reflectionTexHasSwappedViews==1
#undef reflectionTexHasSwappedViews
#define reflectionTexHasSwappedViews 1
#endif
#ifndef reflectionTexLayout
#define reflectionTexLayout 0
#endif
#ifndef reflectionModulationTexHasSwappedViews
#define reflectionModulationTexHasSwappedViews 0
#elif reflectionModulationTexHasSwappedViews==1
#undef reflectionModulationTexHasSwappedViews
#define reflectionModulationTexHasSwappedViews 1
#endif
#ifndef reflectionModulationTexLayout
#define reflectionModulationTexLayout 0
#endif
#ifndef rimColorTexHasSwappedViews
#define rimColorTexHasSwappedViews 0
#elif rimColorTexHasSwappedViews==1
#undef rimColorTexHasSwappedViews
#define rimColorTexHasSwappedViews 1
#endif
#ifndef rimColorTexLayout
#define rimColorTexLayout 0
#endif
#ifndef materialParamsTexHasSwappedViews
#define materialParamsTexHasSwappedViews 0
#elif materialParamsTexHasSwappedViews==1
#undef materialParamsTexHasSwappedViews
#define materialParamsTexHasSwappedViews 1
#endif
#ifndef materialParamsTexLayout
#define materialParamsTexLayout 0
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
#ifndef NODE_38_DROPLIST_ITEM
#define NODE_38_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_BASE_TEX
#define ENABLE_BASE_TEX 0
#elif ENABLE_BASE_TEX==1
#undef ENABLE_BASE_TEX
#define ENABLE_BASE_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex
#define SC_USE_UV_TRANSFORM_baseTex 0
#elif SC_USE_UV_TRANSFORM_baseTex==1
#undef SC_USE_UV_TRANSFORM_baseTex
#define SC_USE_UV_TRANSFORM_baseTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex
#define SC_SOFTWARE_WRAP_MODE_U_baseTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex
#define SC_SOFTWARE_WRAP_MODE_V_baseTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex
#define SC_USE_UV_MIN_MAX_baseTex 0
#elif SC_USE_UV_MIN_MAX_baseTex==1
#undef SC_USE_UV_MIN_MAX_baseTex
#define SC_USE_UV_MIN_MAX_baseTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex
#define SC_USE_CLAMP_TO_BORDER_baseTex 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex
#define SC_USE_CLAMP_TO_BORDER_baseTex 1
#endif
#ifndef NODE_27_DROPLIST_ITEM
#define NODE_27_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_RECOLOR
#define ENABLE_RECOLOR 0
#elif ENABLE_RECOLOR==1
#undef ENABLE_RECOLOR
#define ENABLE_RECOLOR 1
#endif
#ifndef ENABLE_OPACITY_TEX
#define ENABLE_OPACITY_TEX 0
#elif ENABLE_OPACITY_TEX==1
#undef ENABLE_OPACITY_TEX
#define ENABLE_OPACITY_TEX 1
#endif
#ifndef SC_USE_UV_TRANSFORM_opacityTex
#define SC_USE_UV_TRANSFORM_opacityTex 0
#elif SC_USE_UV_TRANSFORM_opacityTex==1
#undef SC_USE_UV_TRANSFORM_opacityTex
#define SC_USE_UV_TRANSFORM_opacityTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_opacityTex
#define SC_SOFTWARE_WRAP_MODE_U_opacityTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_opacityTex
#define SC_SOFTWARE_WRAP_MODE_V_opacityTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_opacityTex
#define SC_USE_UV_MIN_MAX_opacityTex 0
#elif SC_USE_UV_MIN_MAX_opacityTex==1
#undef SC_USE_UV_MIN_MAX_opacityTex
#define SC_USE_UV_MIN_MAX_opacityTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_opacityTex
#define SC_USE_CLAMP_TO_BORDER_opacityTex 0
#elif SC_USE_CLAMP_TO_BORDER_opacityTex==1
#undef SC_USE_CLAMP_TO_BORDER_opacityTex
#define SC_USE_CLAMP_TO_BORDER_opacityTex 1
#endif
#ifndef NODE_69_DROPLIST_ITEM
#define NODE_69_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_NORMALMAP
#define ENABLE_NORMALMAP 0
#elif ENABLE_NORMALMAP==1
#undef ENABLE_NORMALMAP
#define ENABLE_NORMALMAP 1
#endif
#ifndef SC_USE_UV_TRANSFORM_normalTex
#define SC_USE_UV_TRANSFORM_normalTex 0
#elif SC_USE_UV_TRANSFORM_normalTex==1
#undef SC_USE_UV_TRANSFORM_normalTex
#define SC_USE_UV_TRANSFORM_normalTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_normalTex
#define SC_SOFTWARE_WRAP_MODE_U_normalTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_normalTex
#define SC_SOFTWARE_WRAP_MODE_V_normalTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_normalTex
#define SC_USE_UV_MIN_MAX_normalTex 0
#elif SC_USE_UV_MIN_MAX_normalTex==1
#undef SC_USE_UV_MIN_MAX_normalTex
#define SC_USE_UV_MIN_MAX_normalTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_normalTex
#define SC_USE_CLAMP_TO_BORDER_normalTex 0
#elif SC_USE_CLAMP_TO_BORDER_normalTex==1
#undef SC_USE_CLAMP_TO_BORDER_normalTex
#define SC_USE_CLAMP_TO_BORDER_normalTex 1
#endif
#ifndef NODE_181_DROPLIST_ITEM
#define NODE_181_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_DETAIL_NORMAL
#define ENABLE_DETAIL_NORMAL 0
#elif ENABLE_DETAIL_NORMAL==1
#undef ENABLE_DETAIL_NORMAL
#define ENABLE_DETAIL_NORMAL 1
#endif
#ifndef SC_USE_UV_TRANSFORM_detailNormalTex
#define SC_USE_UV_TRANSFORM_detailNormalTex 0
#elif SC_USE_UV_TRANSFORM_detailNormalTex==1
#undef SC_USE_UV_TRANSFORM_detailNormalTex
#define SC_USE_UV_TRANSFORM_detailNormalTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_detailNormalTex
#define SC_SOFTWARE_WRAP_MODE_U_detailNormalTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_detailNormalTex
#define SC_SOFTWARE_WRAP_MODE_V_detailNormalTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_detailNormalTex
#define SC_USE_UV_MIN_MAX_detailNormalTex 0
#elif SC_USE_UV_MIN_MAX_detailNormalTex==1
#undef SC_USE_UV_MIN_MAX_detailNormalTex
#define SC_USE_UV_MIN_MAX_detailNormalTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_detailNormalTex
#define SC_USE_CLAMP_TO_BORDER_detailNormalTex 0
#elif SC_USE_CLAMP_TO_BORDER_detailNormalTex==1
#undef SC_USE_CLAMP_TO_BORDER_detailNormalTex
#define SC_USE_CLAMP_TO_BORDER_detailNormalTex 1
#endif
#ifndef NODE_184_DROPLIST_ITEM
#define NODE_184_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_EMISSIVE
#define ENABLE_EMISSIVE 0
#elif ENABLE_EMISSIVE==1
#undef ENABLE_EMISSIVE
#define ENABLE_EMISSIVE 1
#endif
#ifndef SC_USE_UV_TRANSFORM_emissiveTex
#define SC_USE_UV_TRANSFORM_emissiveTex 0
#elif SC_USE_UV_TRANSFORM_emissiveTex==1
#undef SC_USE_UV_TRANSFORM_emissiveTex
#define SC_USE_UV_TRANSFORM_emissiveTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_emissiveTex
#define SC_SOFTWARE_WRAP_MODE_U_emissiveTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_emissiveTex
#define SC_SOFTWARE_WRAP_MODE_V_emissiveTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_emissiveTex
#define SC_USE_UV_MIN_MAX_emissiveTex 0
#elif SC_USE_UV_MIN_MAX_emissiveTex==1
#undef SC_USE_UV_MIN_MAX_emissiveTex
#define SC_USE_UV_MIN_MAX_emissiveTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_emissiveTex
#define SC_USE_CLAMP_TO_BORDER_emissiveTex 0
#elif SC_USE_CLAMP_TO_BORDER_emissiveTex==1
#undef SC_USE_CLAMP_TO_BORDER_emissiveTex
#define SC_USE_CLAMP_TO_BORDER_emissiveTex 1
#endif
#ifndef NODE_76_DROPLIST_ITEM
#define NODE_76_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_SIMPLE_REFLECTION
#define ENABLE_SIMPLE_REFLECTION 0
#elif ENABLE_SIMPLE_REFLECTION==1
#undef ENABLE_SIMPLE_REFLECTION
#define ENABLE_SIMPLE_REFLECTION 1
#endif
#ifndef SC_USE_UV_TRANSFORM_reflectionTex
#define SC_USE_UV_TRANSFORM_reflectionTex 0
#elif SC_USE_UV_TRANSFORM_reflectionTex==1
#undef SC_USE_UV_TRANSFORM_reflectionTex
#define SC_USE_UV_TRANSFORM_reflectionTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_reflectionTex
#define SC_SOFTWARE_WRAP_MODE_U_reflectionTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_reflectionTex
#define SC_SOFTWARE_WRAP_MODE_V_reflectionTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_reflectionTex
#define SC_USE_UV_MIN_MAX_reflectionTex 0
#elif SC_USE_UV_MIN_MAX_reflectionTex==1
#undef SC_USE_UV_MIN_MAX_reflectionTex
#define SC_USE_UV_MIN_MAX_reflectionTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_reflectionTex
#define SC_USE_CLAMP_TO_BORDER_reflectionTex 0
#elif SC_USE_CLAMP_TO_BORDER_reflectionTex==1
#undef SC_USE_CLAMP_TO_BORDER_reflectionTex
#define SC_USE_CLAMP_TO_BORDER_reflectionTex 1
#endif
#ifndef Tweak_N177
#define Tweak_N177 0
#elif Tweak_N177==1
#undef Tweak_N177
#define Tweak_N177 1
#endif
#ifndef NODE_228_DROPLIST_ITEM
#define NODE_228_DROPLIST_ITEM 0
#endif
#ifndef SC_USE_UV_TRANSFORM_reflectionModulationTex
#define SC_USE_UV_TRANSFORM_reflectionModulationTex 0
#elif SC_USE_UV_TRANSFORM_reflectionModulationTex==1
#undef SC_USE_UV_TRANSFORM_reflectionModulationTex
#define SC_USE_UV_TRANSFORM_reflectionModulationTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex
#define SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex
#define SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_reflectionModulationTex
#define SC_USE_UV_MIN_MAX_reflectionModulationTex 0
#elif SC_USE_UV_MIN_MAX_reflectionModulationTex==1
#undef SC_USE_UV_MIN_MAX_reflectionModulationTex
#define SC_USE_UV_MIN_MAX_reflectionModulationTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_reflectionModulationTex
#define SC_USE_CLAMP_TO_BORDER_reflectionModulationTex 0
#elif SC_USE_CLAMP_TO_BORDER_reflectionModulationTex==1
#undef SC_USE_CLAMP_TO_BORDER_reflectionModulationTex
#define SC_USE_CLAMP_TO_BORDER_reflectionModulationTex 1
#endif
#ifndef ENABLE_RIM_HIGHLIGHT
#define ENABLE_RIM_HIGHLIGHT 0
#elif ENABLE_RIM_HIGHLIGHT==1
#undef ENABLE_RIM_HIGHLIGHT
#define ENABLE_RIM_HIGHLIGHT 1
#endif
#ifndef Tweak_N216
#define Tweak_N216 0
#elif Tweak_N216==1
#undef Tweak_N216
#define Tweak_N216 1
#endif
#ifndef ENABLE_RIM_INVERT
#define ENABLE_RIM_INVERT 0
#elif ENABLE_RIM_INVERT==1
#undef ENABLE_RIM_INVERT
#define ENABLE_RIM_INVERT 1
#endif
#ifndef SC_USE_UV_TRANSFORM_rimColorTex
#define SC_USE_UV_TRANSFORM_rimColorTex 0
#elif SC_USE_UV_TRANSFORM_rimColorTex==1
#undef SC_USE_UV_TRANSFORM_rimColorTex
#define SC_USE_UV_TRANSFORM_rimColorTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_rimColorTex
#define SC_SOFTWARE_WRAP_MODE_U_rimColorTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_rimColorTex
#define SC_SOFTWARE_WRAP_MODE_V_rimColorTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_rimColorTex
#define SC_USE_UV_MIN_MAX_rimColorTex 0
#elif SC_USE_UV_MIN_MAX_rimColorTex==1
#undef SC_USE_UV_MIN_MAX_rimColorTex
#define SC_USE_UV_MIN_MAX_rimColorTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_rimColorTex
#define SC_USE_CLAMP_TO_BORDER_rimColorTex 0
#elif SC_USE_CLAMP_TO_BORDER_rimColorTex==1
#undef SC_USE_CLAMP_TO_BORDER_rimColorTex
#define SC_USE_CLAMP_TO_BORDER_rimColorTex 1
#endif
#ifndef NODE_315_DROPLIST_ITEM
#define NODE_315_DROPLIST_ITEM 0
#endif
#ifndef SC_USE_UV_TRANSFORM_materialParamsTex
#define SC_USE_UV_TRANSFORM_materialParamsTex 0
#elif SC_USE_UV_TRANSFORM_materialParamsTex==1
#undef SC_USE_UV_TRANSFORM_materialParamsTex
#define SC_USE_UV_TRANSFORM_materialParamsTex 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_materialParamsTex
#define SC_SOFTWARE_WRAP_MODE_U_materialParamsTex -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_materialParamsTex
#define SC_SOFTWARE_WRAP_MODE_V_materialParamsTex -1
#endif
#ifndef SC_USE_UV_MIN_MAX_materialParamsTex
#define SC_USE_UV_MIN_MAX_materialParamsTex 0
#elif SC_USE_UV_MIN_MAX_materialParamsTex==1
#undef SC_USE_UV_MIN_MAX_materialParamsTex
#define SC_USE_UV_MIN_MAX_materialParamsTex 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_materialParamsTex
#define SC_USE_CLAMP_TO_BORDER_materialParamsTex 0
#elif SC_USE_CLAMP_TO_BORDER_materialParamsTex==1
#undef SC_USE_CLAMP_TO_BORDER_materialParamsTex
#define SC_USE_CLAMP_TO_BORDER_materialParamsTex 1
#endif
#ifndef NODE_221_DROPLIST_ITEM
#define NODE_221_DROPLIST_ITEM 0
#endif
#ifndef ENABLE_SPECULAR_AO
#define ENABLE_SPECULAR_AO 0
#elif ENABLE_SPECULAR_AO==1
#undef ENABLE_SPECULAR_AO
#define ENABLE_SPECULAR_AO 1
#endif
#ifndef ENABLE_UV2
#define ENABLE_UV2 0
#elif ENABLE_UV2==1
#undef ENABLE_UV2
#define ENABLE_UV2 1
#endif
#ifndef NODE_13_DROPLIST_ITEM
#define NODE_13_DROPLIST_ITEM 0
#endif
#ifndef uv2EnableAnimation
#define uv2EnableAnimation 0
#elif uv2EnableAnimation==1
#undef uv2EnableAnimation
#define uv2EnableAnimation 1
#endif
#ifndef ENABLE_UV3
#define ENABLE_UV3 0
#elif ENABLE_UV3==1
#undef ENABLE_UV3
#define ENABLE_UV3 1
#endif
#ifndef NODE_49_DROPLIST_ITEM
#define NODE_49_DROPLIST_ITEM 0
#endif
#ifndef uv3EnableAnimation
#define uv3EnableAnimation 0
#elif uv3EnableAnimation==1
#undef uv3EnableAnimation
#define uv3EnableAnimation 1
#endif
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
layout(binding=1,std430) readonly buffer layoutVertices
{
float _Vertices[];
} layoutVertices_obj;
layout(binding=2,std430) readonly buffer layoutVerticesPN
{
float _VerticesPN[];
} layoutVerticesPN_obj;
layout(binding=0,std430) readonly buffer layoutIndices
{
uint _Triangles[];
} layoutIndices_obj;
uniform vec4 sc_EnvmapDiffuseDims;
uniform vec4 sc_EnvmapSpecularDims;
uniform vec4 sc_ScreenTextureDims;
uniform bool receivesRayTracedReflections;
uniform bool isProxyMode;
uniform bool receivesRayTracedShadows;
uniform bool receivesRayTracedDiffuseIndirect;
uniform bool receivesRayTracedAo;
uniform vec4 sc_RayTracedReflectionTextureDims;
uniform vec4 sc_RayTracedShadowTextureDims;
uniform vec4 sc_RayTracedDiffIndTextureDims;
uniform vec4 sc_RayTracedAoTextureDims;
uniform bool noEarlyZ;
uniform vec4 z_rayDirectionsDims;
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
uniform int emitter_stride;
uniform int proxy_offset_position;
uniform int proxy_format_position;
uniform int proxy_offset_normal;
uniform int proxy_format_normal;
uniform int proxy_offset_tangent;
uniform int proxy_format_tangent;
uniform int proxy_offset_color;
uniform int proxy_format_color;
uniform int proxy_offset_texture0;
uniform int proxy_format_texture0;
uniform int proxy_offset_texture1;
uniform int proxy_format_texture1;
uniform int proxy_offset_texture2;
uniform int proxy_format_texture2;
uniform int proxy_offset_texture3;
uniform int proxy_format_texture3;
uniform int lray_triangles_last;
uniform int instance_id;
uniform bool has_animated_pn;
uniform mat4 sc_ModelMatrix;
uniform mat3 sc_NormalMatrix;
uniform vec4 intensityTextureDims;
uniform float correctedIntensity;
uniform mat3 intensityTextureTransform;
uniform vec4 intensityTextureUvMinMax;
uniform vec4 intensityTextureBorderColor;
uniform float alphaTestThreshold;
uniform vec4 baseTexDims;
uniform vec4 opacityTexDims;
uniform vec4 normalTexDims;
uniform vec4 detailNormalTexDims;
uniform vec4 emissiveTexDims;
uniform vec4 reflectionTexDims;
uniform vec4 reflectionModulationTexDims;
uniform vec4 rimColorTexDims;
uniform vec4 materialParamsTexDims;
uniform sc_LightEstimationData_t sc_LightEstimationData;
uniform vec3 sc_EnvmapRotation;
uniform vec4 sc_EnvmapSpecularSize;
uniform vec4 sc_EnvmapDiffuseSize;
uniform float sc_EnvmapExposure;
uniform vec3 sc_Sh[9];
uniform float sc_ShIntensity;
uniform sc_AmbientLight_t sc_AmbientLights[sc_AmbientLightsCount+1];
uniform sc_DirectionalLight_t sc_DirectionalLights[sc_DirectionalLightsCount+1];
uniform sc_PointLight_t sc_PointLights[sc_PointLightsCount+1];
uniform mat3 baseTexTransform;
uniform vec4 baseTexUvMinMax;
uniform vec4 baseTexBorderColor;
uniform mat3 opacityTexTransform;
uniform vec4 opacityTexUvMinMax;
uniform vec4 opacityTexBorderColor;
uniform mat3 normalTexTransform;
uniform vec4 normalTexUvMinMax;
uniform vec4 normalTexBorderColor;
uniform mat3 detailNormalTexTransform;
uniform vec4 detailNormalTexUvMinMax;
uniform vec4 detailNormalTexBorderColor;
uniform mat3 emissiveTexTransform;
uniform vec4 emissiveTexUvMinMax;
uniform vec4 emissiveTexBorderColor;
uniform mat3 reflectionTexTransform;
uniform vec4 reflectionTexUvMinMax;
uniform vec4 reflectionTexBorderColor;
uniform mat3 reflectionModulationTexTransform;
uniform vec4 reflectionModulationTexUvMinMax;
uniform vec4 reflectionModulationTexBorderColor;
uniform mat3 rimColorTexTransform;
uniform vec4 rimColorTexUvMinMax;
uniform vec4 rimColorTexBorderColor;
uniform mat3 materialParamsTexTransform;
uniform vec4 materialParamsTexUvMinMax;
uniform vec4 materialParamsTexBorderColor;
uniform vec4 baseColor;
uniform vec3 recolorRed;
uniform vec3 recolorGreen;
uniform vec3 recolorBlue;
uniform vec3 emissiveColor;
uniform float emissiveIntensity;
uniform float reflectionIntensity;
uniform vec3 rimColor;
uniform float rimIntensity;
uniform float rimExponent;
uniform float metallic;
uniform float roughness;
uniform float specularAoIntensity;
uniform float specularAoDarkening;
uniform vec2 uv2Scale;
uniform vec2 uv2Offset;
uniform vec2 uv3Scale;
uniform vec2 uv3Offset;
uniform int overrideTimeEnabled;
uniform float overrideTimeElapsed;
uniform vec4 sc_Time;
uniform float overrideTimeDelta;
uniform sc_Camera_t sc_Camera;
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
uniform mat3 sc_NormalMatrixInverse;
uniform mat4 sc_PrevFrameModelMatrixInverse;
uniform vec3 sc_LocalAabbMin;
uniform vec3 sc_LocalAabbMax;
uniform vec3 sc_WorldAabbMin;
uniform vec3 sc_WorldAabbMax;
uniform vec4 sc_WindowToViewportTransform;
uniform mat4 sc_ProjectorMatrix;
uniform float sc_DisableFrustumCullingMarker;
uniform vec4 sc_BoneMatrices[(sc_SkinBonesCount*3)+1];
uniform mat3 sc_SkinBonesNormalMatrices[sc_SkinBonesCount+1];
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
uniform vec4 sc_RayTracedReflectionTextureSize;
uniform vec4 sc_RayTracedReflectionTextureView;
uniform vec4 sc_RayTracedShadowTextureSize;
uniform vec4 sc_RayTracedShadowTextureView;
uniform vec4 sc_RayTracedDiffIndTextureSize;
uniform vec4 sc_RayTracedDiffIndTextureView;
uniform vec4 sc_RayTracedAoTextureSize;
uniform vec4 sc_RayTracedAoTextureView;
uniform float receiver_mask;
uniform vec3 OriginNormalizationScale;
uniform vec3 OriginNormalizationScaleInv;
uniform vec3 OriginNormalizationOffset;
uniform int receiverId;
uniform vec4 z_rayDirectionsSize;
uniform vec4 z_rayDirectionsView;
uniform vec4 intensityTextureSize;
uniform vec4 intensityTextureView;
uniform float reflBlurWidth;
uniform float reflBlurMinRough;
uniform float reflBlurMaxRough;
uniform int PreviewNodeID;
uniform vec4 baseTexSize;
uniform vec4 baseTexView;
uniform vec4 opacityTexSize;
uniform vec4 opacityTexView;
uniform vec4 normalTexSize;
uniform vec4 normalTexView;
uniform vec4 detailNormalTexSize;
uniform vec4 detailNormalTexView;
uniform vec4 emissiveTexSize;
uniform vec4 emissiveTexView;
uniform vec4 reflectionTexSize;
uniform vec4 reflectionTexView;
uniform vec4 reflectionModulationTexSize;
uniform vec4 reflectionModulationTexView;
uniform vec4 rimColorTexSize;
uniform vec4 rimColorTexView;
uniform vec4 materialParamsTexSize;
uniform vec4 materialParamsTexView;
uniform float depthRef;
uniform usampler2D z_hitIdAndBarycentric;
uniform sampler2D z_rayDirections;
uniform sampler2D baseTex;
uniform sampler2DArray baseTexArrSC;
uniform sampler2D opacityTex;
uniform sampler2DArray opacityTexArrSC;
uniform sampler2D normalTex;
uniform sampler2DArray normalTexArrSC;
uniform sampler2D detailNormalTex;
uniform sampler2DArray detailNormalTexArrSC;
uniform sampler2D emissiveTex;
uniform sampler2DArray emissiveTexArrSC;
uniform sampler2D reflectionTex;
uniform sampler2DArray reflectionTexArrSC;
uniform sampler2D reflectionModulationTex;
uniform sampler2DArray reflectionModulationTexArrSC;
uniform sampler2D rimColorTex;
uniform sampler2DArray rimColorTexArrSC;
uniform sampler2D materialParamsTex;
uniform sampler2DArray materialParamsTexArrSC;
uniform sampler2D sc_SSAOTexture;
uniform sampler2D sc_ShadowTexture;
uniform sampler2D sc_RayTracedShadowTexture;
uniform sampler2DArray sc_RayTracedShadowTextureArrSC;
uniform sampler2D sc_EnvmapSpecular;
uniform sampler2DArray sc_EnvmapSpecularArrSC;
uniform sampler2D sc_EnvmapDiffuse;
uniform sampler2DArray sc_EnvmapDiffuseArrSC;
uniform sampler2D sc_RayTracedDiffIndTexture;
uniform sampler2DArray sc_RayTracedDiffIndTextureArrSC;
uniform sampler2D sc_RayTracedReflectionTexture;
uniform sampler2DArray sc_RayTracedReflectionTextureArrSC;
uniform sampler2D sc_ScreenTexture;
uniform sampler2DArray sc_ScreenTextureArrSC;
uniform sampler2D sc_RayTracedAoTexture;
uniform sampler2DArray sc_RayTracedAoTextureArrSC;
uniform sampler2D intensityTexture;
uniform sampler2DArray intensityTextureArrSC;
uniform sampler2D sc_OITFrontDepthTexture;
uniform sampler2D sc_OITDepthHigh0;
uniform sampler2D sc_OITDepthLow0;
uniform sampler2D sc_OITAlpha0;
uniform sampler2D sc_OITDepthHigh1;
uniform sampler2D sc_OITDepthLow1;
uniform sampler2D sc_OITAlpha1;
uniform sampler2D sc_OITFilteredDepthBoundsTexture;
flat in int varStereoViewID;
in vec2 varShadowTex;
in float varClipDistance;
in float varViewSpaceDepth;
in vec4 PreviewVertexColor;
in float PreviewVertexSaved;
in vec3 varPos;
in vec3 varNormal;
in vec4 varTangent;
in vec4 varPackedTex;
in vec4 varColor;
in vec4 varScreenPos;
in vec2 varScreenTexturePos;
bool N7_EnableUV2;
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
l9_0=varStereoViewID;
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
vec3 interp_float3_animated(vec3 brc,ivec3 indices,int offset)
{
ivec3 l9_0=(indices*ivec3(6))+ivec3(offset);
int l9_1=l9_0.x;
int l9_2=l9_0.y;
int l9_3=l9_0.z;
return ((vec3(layoutVerticesPN_obj._VerticesPN[l9_1],layoutVerticesPN_obj._VerticesPN[l9_1+1],layoutVerticesPN_obj._VerticesPN[l9_1+2])*brc.x)+(vec3(layoutVerticesPN_obj._VerticesPN[l9_2],layoutVerticesPN_obj._VerticesPN[l9_2+1],layoutVerticesPN_obj._VerticesPN[l9_2+2])*brc.y))+(vec3(layoutVerticesPN_obj._VerticesPN[l9_3],layoutVerticesPN_obj._VerticesPN[l9_3+1],layoutVerticesPN_obj._VerticesPN[l9_3+2])*brc.z);
}
vec4 fetch_unorm_byte4(int offset)
{
uint l9_0=floatBitsToUint(layoutVertices_obj._Vertices[offset]);
return vec4(float(l9_0&255u),float((l9_0>>uint(8))&255u),float((l9_0>>uint(16))&255u),float((l9_0>>uint(24))&255u))/vec4(255.0);
}
RayHitPayload GetHitData(ivec2 screenPos)
{
ivec2 l9_0=screenPos;
uvec4 l9_1=texelFetch(z_hitIdAndBarycentric,l9_0,0);
uvec2 l9_2=l9_1.xy;
if (l9_1.x!=uint(instance_id))
{
return RayHitPayload(vec3(0.0),vec3(0.0),vec3(0.0),vec4(0.0),vec4(0.0),vec2(0.0),vec2(0.0),vec2(0.0),vec2(0.0),l9_2);
}
vec2 l9_3=unpackHalf2x16(l9_1.z|(l9_1.w<<uint(16)));
float l9_4=l9_3.x;
float l9_5=l9_3.y;
float l9_6=(1.0-l9_4)-l9_5;
vec3 l9_7=vec3(l9_6,l9_4,l9_5);
ivec2 l9_8=screenPos;
vec4 l9_9=texelFetch(z_rayDirections,l9_8,0);
float l9_10=l9_9.x;
float l9_11=l9_9.y;
float l9_12=(1.0-abs(l9_10))-abs(l9_11);
vec3 l9_13=vec3(l9_10,l9_11,l9_12);
float l9_14=clamp(-l9_12,0.0,1.0);
float l9_15;
if (l9_10>=0.0)
{
l9_15=-l9_14;
}
else
{
l9_15=l9_14;
}
float l9_16;
if (l9_11>=0.0)
{
l9_16=-l9_14;
}
else
{
l9_16=l9_14;
}
vec2 l9_17=vec2(l9_15,l9_16);
vec2 l9_18=l9_13.xy+l9_17;
uint l9_19=min(l9_1.y,uint(lray_triangles_last))*6u;
uint l9_20=l9_19&4294967292u;
uint l9_21=l9_20/4u;
uint l9_22=layoutIndices_obj._Triangles[l9_21];
uint l9_23=l9_21+1u;
uint l9_24=layoutIndices_obj._Triangles[l9_23];
uvec4 l9_25=(uvec4(l9_22,l9_22,l9_24,l9_24)&uvec4(65535u,4294967295u,65535u,4294967295u))>>uvec4(0u,16u,0u,16u);
ivec3 l9_26;
if (l9_19==l9_20)
{
l9_26=ivec3(l9_25.xyz);
}
else
{
l9_26=ivec3(l9_25.yzw);
}
vec3 l9_27;
if (has_animated_pn)
{
l9_27=interp_float3_animated(l9_7,l9_26,0);
}
else
{
int l9_28=(l9_26.x*emitter_stride)+proxy_offset_position;
int l9_29=(l9_26.y*emitter_stride)+proxy_offset_position;
int l9_30=(l9_26.z*emitter_stride)+proxy_offset_position;
vec3 l9_31;
if (proxy_format_position==5)
{
l9_31=((vec3(layoutVertices_obj._Vertices[l9_28],layoutVertices_obj._Vertices[l9_28+1],layoutVertices_obj._Vertices[l9_28+2])*l9_6)+(vec3(layoutVertices_obj._Vertices[l9_29],layoutVertices_obj._Vertices[l9_29+1],layoutVertices_obj._Vertices[l9_29+2])*l9_4))+(vec3(layoutVertices_obj._Vertices[l9_30],layoutVertices_obj._Vertices[l9_30+1],layoutVertices_obj._Vertices[l9_30+2])*l9_5);
}
else
{
vec3 l9_32;
if (proxy_format_position==6)
{
l9_32=((vec3(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_28])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_28+1])).x)*l9_6)+(vec3(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_29])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_29+1])).x)*l9_4))+(vec3(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_30])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_30+1])).x)*l9_5);
}
else
{
l9_32=vec3(1.0,0.0,0.0);
}
l9_31=l9_32;
}
l9_27=(sc_ModelMatrix*vec4(l9_31,1.0)).xyz;
}
vec3 l9_33;
if (proxy_offset_normal>0)
{
vec3 l9_34;
if (has_animated_pn)
{
l9_34=interp_float3_animated(l9_7,l9_26,3);
}
else
{
int l9_35=(l9_26.x*emitter_stride)+proxy_offset_normal;
int l9_36=(l9_26.y*emitter_stride)+proxy_offset_normal;
int l9_37=(l9_26.z*emitter_stride)+proxy_offset_normal;
vec3 l9_38;
if (proxy_format_normal==5)
{
l9_38=((vec3(layoutVertices_obj._Vertices[l9_35],layoutVertices_obj._Vertices[l9_35+1],layoutVertices_obj._Vertices[l9_35+2])*l9_6)+(vec3(layoutVertices_obj._Vertices[l9_36],layoutVertices_obj._Vertices[l9_36+1],layoutVertices_obj._Vertices[l9_36+2])*l9_4))+(vec3(layoutVertices_obj._Vertices[l9_37],layoutVertices_obj._Vertices[l9_37+1],layoutVertices_obj._Vertices[l9_37+2])*l9_5);
}
else
{
vec3 l9_39;
if (proxy_format_normal==6)
{
l9_39=((vec3(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_35])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_35+1])).x)*l9_6)+(vec3(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_36])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_36+1])).x)*l9_4))+(vec3(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_37])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_37+1])).x)*l9_5);
}
else
{
l9_39=vec3(1.0,0.0,0.0);
}
l9_38=l9_39;
}
l9_34=normalize(sc_NormalMatrix*l9_38);
}
l9_33=l9_34;
}
else
{
l9_33=vec3(1.0,0.0,0.0);
}
vec4 l9_40;
if ((!has_animated_pn)&&(proxy_offset_tangent>0))
{
int l9_41=(l9_26.x*emitter_stride)+proxy_offset_tangent;
int l9_42=(l9_26.y*emitter_stride)+proxy_offset_tangent;
int l9_43=(l9_26.z*emitter_stride)+proxy_offset_tangent;
vec4 l9_44;
if (proxy_format_tangent==5)
{
l9_44=((vec4(layoutVertices_obj._Vertices[l9_41],layoutVertices_obj._Vertices[l9_41+1],layoutVertices_obj._Vertices[l9_41+2],layoutVertices_obj._Vertices[l9_41+3])*l9_6)+(vec4(layoutVertices_obj._Vertices[l9_42],layoutVertices_obj._Vertices[l9_42+1],layoutVertices_obj._Vertices[l9_42+2],layoutVertices_obj._Vertices[l9_42+3])*l9_4))+(vec4(layoutVertices_obj._Vertices[l9_43],layoutVertices_obj._Vertices[l9_43+1],layoutVertices_obj._Vertices[l9_43+2],layoutVertices_obj._Vertices[l9_43+3])*l9_5);
}
else
{
vec4 l9_45;
if (proxy_format_tangent==6)
{
l9_45=((vec4(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_41])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_41+1])))*l9_6)+(vec4(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_42])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_42+1])))*l9_4))+(vec4(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_43])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_43+1])))*l9_5);
}
else
{
vec4 l9_46;
if (proxy_format_tangent==2)
{
l9_46=((fetch_unorm_byte4(l9_41)*l9_6)+(fetch_unorm_byte4(l9_42)*l9_4))+(fetch_unorm_byte4(l9_43)*l9_5);
}
else
{
l9_46=vec4(1.0,0.0,0.0,0.0);
}
l9_45=l9_46;
}
l9_44=l9_45;
}
l9_40=vec4(normalize(sc_NormalMatrix*l9_44.xyz),l9_44.w);
}
else
{
l9_40=vec4(1.0,0.0,0.0,1.0);
}
vec4 l9_47;
if (proxy_format_color>0)
{
int l9_48=(l9_26.x*emitter_stride)+proxy_offset_color;
int l9_49=(l9_26.y*emitter_stride)+proxy_offset_color;
int l9_50=(l9_26.z*emitter_stride)+proxy_offset_color;
vec4 l9_51;
if (proxy_format_color==5)
{
l9_51=((vec4(layoutVertices_obj._Vertices[l9_48],layoutVertices_obj._Vertices[l9_48+1],layoutVertices_obj._Vertices[l9_48+2],layoutVertices_obj._Vertices[l9_48+3])*l9_6)+(vec4(layoutVertices_obj._Vertices[l9_49],layoutVertices_obj._Vertices[l9_49+1],layoutVertices_obj._Vertices[l9_49+2],layoutVertices_obj._Vertices[l9_49+3])*l9_4))+(vec4(layoutVertices_obj._Vertices[l9_50],layoutVertices_obj._Vertices[l9_50+1],layoutVertices_obj._Vertices[l9_50+2],layoutVertices_obj._Vertices[l9_50+3])*l9_5);
}
else
{
vec4 l9_52;
if (proxy_format_color==6)
{
l9_52=((vec4(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_48])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_48+1])))*l9_6)+(vec4(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_49])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_49+1])))*l9_4))+(vec4(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_50])),unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_50+1])))*l9_5);
}
else
{
vec4 l9_53;
if (proxy_format_color==2)
{
l9_53=((fetch_unorm_byte4(l9_48)*l9_6)+(fetch_unorm_byte4(l9_49)*l9_4))+(fetch_unorm_byte4(l9_50)*l9_5);
}
else
{
l9_53=vec4(1.0,0.0,0.0,0.0);
}
l9_52=l9_53;
}
l9_51=l9_52;
}
l9_47=l9_51;
}
else
{
l9_47=vec4(0.0);
}
ivec3 l9_54=l9_26%ivec3(2);
vec2 l9_55=vec2(dot(l9_7,vec3(ivec3(1)-l9_54)),0.0);
vec2 l9_56;
if (proxy_format_texture0>0)
{
int l9_57=(l9_26.x*emitter_stride)+proxy_offset_texture0;
int l9_58=(l9_26.y*emitter_stride)+proxy_offset_texture0;
int l9_59=(l9_26.z*emitter_stride)+proxy_offset_texture0;
vec2 l9_60;
if (proxy_format_texture0==5)
{
l9_60=((vec2(layoutVertices_obj._Vertices[l9_57],layoutVertices_obj._Vertices[l9_57+1])*l9_6)+(vec2(layoutVertices_obj._Vertices[l9_58],layoutVertices_obj._Vertices[l9_58+1])*l9_4))+(vec2(layoutVertices_obj._Vertices[l9_59],layoutVertices_obj._Vertices[l9_59+1])*l9_5);
}
else
{
vec2 l9_61;
if (proxy_format_texture0==6)
{
l9_61=((unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_57]))*l9_6)+(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_58]))*l9_4))+(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_59]))*l9_5);
}
else
{
l9_61=vec2(1.0,0.0);
}
l9_60=l9_61;
}
l9_56=l9_60;
}
else
{
l9_56=l9_55;
}
vec2 l9_62;
if (proxy_format_texture1>0)
{
int l9_63=(l9_26.x*emitter_stride)+proxy_offset_texture1;
int l9_64=(l9_26.y*emitter_stride)+proxy_offset_texture1;
int l9_65=(l9_26.z*emitter_stride)+proxy_offset_texture1;
vec2 l9_66;
if (proxy_format_texture1==5)
{
l9_66=((vec2(layoutVertices_obj._Vertices[l9_63],layoutVertices_obj._Vertices[l9_63+1])*l9_6)+(vec2(layoutVertices_obj._Vertices[l9_64],layoutVertices_obj._Vertices[l9_64+1])*l9_4))+(vec2(layoutVertices_obj._Vertices[l9_65],layoutVertices_obj._Vertices[l9_65+1])*l9_5);
}
else
{
vec2 l9_67;
if (proxy_format_texture1==6)
{
l9_67=((unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_63]))*l9_6)+(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_64]))*l9_4))+(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_65]))*l9_5);
}
else
{
l9_67=vec2(1.0,0.0);
}
l9_66=l9_67;
}
l9_62=l9_66;
}
else
{
l9_62=l9_55;
}
vec2 l9_68;
if (proxy_format_texture2>0)
{
int l9_69=(l9_26.x*emitter_stride)+proxy_offset_texture2;
int l9_70=(l9_26.y*emitter_stride)+proxy_offset_texture2;
int l9_71=(l9_26.z*emitter_stride)+proxy_offset_texture2;
vec2 l9_72;
if (proxy_format_texture2==5)
{
l9_72=((vec2(layoutVertices_obj._Vertices[l9_69],layoutVertices_obj._Vertices[l9_69+1])*l9_6)+(vec2(layoutVertices_obj._Vertices[l9_70],layoutVertices_obj._Vertices[l9_70+1])*l9_4))+(vec2(layoutVertices_obj._Vertices[l9_71],layoutVertices_obj._Vertices[l9_71+1])*l9_5);
}
else
{
vec2 l9_73;
if (proxy_format_texture2==6)
{
l9_73=((unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_69]))*l9_6)+(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_70]))*l9_4))+(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_71]))*l9_5);
}
else
{
l9_73=vec2(1.0,0.0);
}
l9_72=l9_73;
}
l9_68=l9_72;
}
else
{
l9_68=l9_55;
}
vec2 l9_74;
if (proxy_format_texture3>0)
{
int l9_75=(l9_26.x*emitter_stride)+proxy_offset_texture3;
int l9_76=(l9_26.y*emitter_stride)+proxy_offset_texture3;
int l9_77=(l9_26.z*emitter_stride)+proxy_offset_texture3;
vec2 l9_78;
if (proxy_format_texture3==5)
{
l9_78=((vec2(layoutVertices_obj._Vertices[l9_75],layoutVertices_obj._Vertices[l9_75+1])*l9_6)+(vec2(layoutVertices_obj._Vertices[l9_76],layoutVertices_obj._Vertices[l9_76+1])*l9_4))+(vec2(layoutVertices_obj._Vertices[l9_77],layoutVertices_obj._Vertices[l9_77+1])*l9_5);
}
else
{
vec2 l9_79;
if (proxy_format_texture3==6)
{
l9_79=((unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_75]))*l9_6)+(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_76]))*l9_4))+(unpackHalf2x16(floatBitsToUint(layoutVertices_obj._Vertices[l9_77]))*l9_5);
}
else
{
l9_79=vec2(1.0,0.0);
}
l9_78=l9_79;
}
l9_74=l9_78;
}
else
{
l9_74=l9_55;
}
return RayHitPayload(-normalize(vec3(l9_18.x,l9_18.y,l9_13.z)),l9_27,l9_33,l9_40,l9_47,l9_56,l9_62,l9_68,l9_74,l9_2);
}
vec2 N7_gettransformUV(int pickUV,vec2 scale,vec2 offset,bool animated,bool enabled)
{
vec2 l9_0=tempGlobals.Surface_UVCoord0;
vec2 l9_1;
if (enabled==N7_EnableUV2)
{
vec2 l9_2;
if (pickUV==0)
{
l9_2=tempGlobals.Surface_UVCoord0;
}
else
{
l9_2=l9_0;
}
vec2 l9_3;
if (pickUV==1)
{
l9_3=tempGlobals.Surface_UVCoord1;
}
else
{
l9_3=l9_2;
}
vec2 l9_4;
if (pickUV==2)
{
l9_4=tempGlobals.gScreenCoord;
}
else
{
l9_4=l9_3;
}
l9_1=l9_4;
}
else
{
vec2 l9_5;
if (pickUV==0)
{
l9_5=tempGlobals.Surface_UVCoord0;
}
else
{
l9_5=l9_0;
}
vec2 l9_6;
if (pickUV==1)
{
l9_6=tempGlobals.Surface_UVCoord1;
}
else
{
l9_6=l9_5;
}
vec2 l9_7;
if (pickUV==2)
{
l9_7=tempGlobals.gScreenCoord;
}
else
{
l9_7=l9_6;
}
vec2 l9_8;
if (pickUV==3)
{
l9_8=tempGlobals.N7_TransformedUV2;
}
else
{
l9_8=l9_7;
}
l9_1=l9_8;
}
vec2 l9_9=scale;
vec2 l9_10=l9_1*l9_9;
vec2 l9_11=offset;
vec2 l9_12=l9_10+l9_11;
vec2 l9_13;
if (animated)
{
l9_13=l9_12+(offset*tempGlobals.gTimeElapsed);
}
else
{
l9_13=l9_12;
}
return l9_13;
}
vec2 N7_getUV(int pickUV)
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
vec2 l9_3;
if (pickUV==2)
{
l9_3=tempGlobals.N7_TransformedUV2;
}
else
{
l9_3=l9_2;
}
vec2 l9_4;
if (pickUV==3)
{
l9_4=tempGlobals.N7_TransformedUV3;
}
else
{
l9_4=l9_3;
}
return l9_4;
}
int baseTexGetStereoViewIndex()
{
int l9_0;
#if (baseTexHasSwappedViews)
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
int opacityTexGetStereoViewIndex()
{
int l9_0;
#if (opacityTexHasSwappedViews)
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
int normalTexGetStereoViewIndex()
{
int l9_0;
#if (normalTexHasSwappedViews)
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
int detailNormalTexGetStereoViewIndex()
{
int l9_0;
#if (detailNormalTexHasSwappedViews)
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
int emissiveTexGetStereoViewIndex()
{
int l9_0;
#if (emissiveTexHasSwappedViews)
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
vec3 ssPow(vec3 A,vec3 B)
{
float l9_0;
if (A.x<=0.0)
{
l9_0=0.0;
}
else
{
l9_0=pow(A.x,B.x);
}
float l9_1;
if (A.y<=0.0)
{
l9_1=0.0;
}
else
{
l9_1=pow(A.y,B.y);
}
float l9_2;
if (A.z<=0.0)
{
l9_2=0.0;
}
else
{
l9_2=pow(A.z,B.z);
}
return vec3(l9_0,l9_1,l9_2);
}
int reflectionTexGetStereoViewIndex()
{
int l9_0;
#if (reflectionTexHasSwappedViews)
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
int reflectionModulationTexGetStereoViewIndex()
{
int l9_0;
#if (reflectionModulationTexHasSwappedViews)
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
vec3 N7_vec3srgbToLinear(vec3 color)
{
return vec3(ssPow(color.x,2.2),ssPow(color.y,2.2),ssPow(color.z,2.2));
}
int rimColorTexGetStereoViewIndex()
{
int l9_0;
#if (rimColorTexHasSwappedViews)
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
int materialParamsTexGetStereoViewIndex()
{
int l9_0;
#if (materialParamsTexHasSwappedViews)
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
return vec3(texture(sc_SSAOTexture,((l9_0.xyz/vec3(l9_0.w)).xy*0.5)+vec2(0.5)).x);
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
float Dggx(float NdotH,float roughness_1)
{
float l9_0=roughness_1;
float l9_1=roughness_1;
float l9_2=l9_0*l9_1;
float l9_3=l9_2*l9_2;
float l9_4=NdotH;
float l9_5=NdotH;
float l9_6=((l9_4*l9_5)*(l9_3-1.0))+1.0;
float l9_7;
if (isProxyMode)
{
l9_7=1e-07;
}
else
{
l9_7=9.9999999e-09;
}
return l9_3/((l9_6*l9_6)+l9_7);
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
vec4 l9_0;
#if (sc_EnvmapSpecularLayout==2)
{
l9_0=texture(sc_EnvmapSpecularArrSC,sc_SamplingCoordsViewToGlobal(uv,sc_EnvmapSpecularLayout,viewIndex),bias);
}
#else
{
l9_0=texture(sc_EnvmapSpecular,sc_SamplingCoordsViewToGlobal(uv,sc_EnvmapSpecularLayout,viewIndex).xy,bias);
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
vec4 sampleRayTracedIndirectDiffuse()
{
if (receivesRayTracedDiffuseIndirect)
{
vec2 l9_0=gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw;
int l9_1;
#if (sc_RayTracedDiffIndTextureHasSwappedViews)
{
l9_1=1-sc_GetStereoViewIndex();
}
#else
{
l9_1=sc_GetStereoViewIndex();
}
#endif
vec4 l9_2;
#if (sc_RayTracedDiffIndTextureLayout==2)
{
l9_2=texture(sc_RayTracedDiffIndTextureArrSC,sc_SamplingCoordsViewToGlobal(l9_0,sc_RayTracedDiffIndTextureLayout,l9_1),0.0);
}
#else
{
l9_2=texture(sc_RayTracedDiffIndTexture,sc_SamplingCoordsViewToGlobal(l9_0,sc_RayTracedDiffIndTextureLayout,l9_1).xy,0.0);
}
#endif
return l9_2;
}
return vec4(0.0);
}
vec3 getSpecularDominantDir(vec3 N,vec3 R,float roughness_1)
{
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
return normalize(mix(R,N,vec3((roughness_1*roughness_1)*roughness_1)));
}
#else
{
return R;
}
#endif
}
vec4 sc_EnvmapSpecularSampleViewIndexLevel(vec2 uv,int viewIndex,float level_)
{
vec4 l9_0;
#if (sc_CanUseTextureLod)
{
vec4 l9_1;
#if (sc_EnvmapSpecularLayout==2)
{
float l9_2=level_;
vec3 l9_3=sc_SamplingCoordsViewToGlobal(uv,sc_EnvmapSpecularLayout,viewIndex);
vec4 l9_4;
#if (sc_CanUseTextureLod)
{
l9_4=textureLod(sc_EnvmapSpecularArrSC,l9_3,l9_2);
}
#else
{
l9_4=vec4(0.0);
}
#endif
l9_1=l9_4;
}
#else
{
l9_1=textureLod(sc_EnvmapSpecular,sc_SamplingCoordsViewToGlobal(uv,sc_EnvmapSpecularLayout,viewIndex).xy,level_);
}
#endif
l9_0=l9_1;
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
vec4 sampleRayTracedReflections()
{
if (!receivesRayTracedReflections)
{
return vec4(0.0);
}
else
{
vec2 l9_0=gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw;
int l9_1;
#if (sc_RayTracedReflectionTextureHasSwappedViews)
{
l9_1=1-sc_GetStereoViewIndex();
}
#else
{
l9_1=sc_GetStereoViewIndex();
}
#endif
vec4 l9_2;
#if (sc_RayTracedReflectionTextureLayout==2)
{
l9_2=texture(sc_RayTracedReflectionTextureArrSC,sc_SamplingCoordsViewToGlobal(l9_0,sc_RayTracedReflectionTextureLayout,l9_1),0.0);
}
#else
{
l9_2=texture(sc_RayTracedReflectionTexture,sc_SamplingCoordsViewToGlobal(l9_0,sc_RayTracedReflectionTextureLayout,l9_1).xy,0.0);
}
#endif
return l9_2;
}
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
vec4 l9_0;
#if (sc_ScreenTextureLayout==2)
{
l9_0=texture(sc_ScreenTextureArrSC,sc_SamplingCoordsViewToGlobal(uv,sc_ScreenTextureLayout,viewIndex),bias);
}
#else
{
l9_0=texture(sc_ScreenTexture,sc_SamplingCoordsViewToGlobal(uv,sc_ScreenTextureLayout,viewIndex).xy,bias);
}
#endif
return l9_0;
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
float sampleRayTracedAo()
{
if (receivesRayTracedAo)
{
vec2 l9_0=gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw;
int l9_1;
#if (sc_RayTracedAoTextureHasSwappedViews)
{
l9_1=1-sc_GetStereoViewIndex();
}
#else
{
l9_1=sc_GetStereoViewIndex();
}
#endif
vec4 l9_2;
#if (sc_RayTracedAoTextureLayout==2)
{
l9_2=texture(sc_RayTracedAoTextureArrSC,sc_SamplingCoordsViewToGlobal(l9_0,sc_RayTracedAoTextureLayout,l9_1),0.0);
}
#else
{
l9_2=texture(sc_RayTracedAoTexture,sc_SamplingCoordsViewToGlobal(l9_0,sc_RayTracedAoTextureLayout,l9_1).xy,0.0);
}
#endif
return l9_2.x;
}
return 0.0;
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
vec4 ngsCalculateLighting(vec3 albedo,float opacity,vec3 normal,vec3 position,vec3 viewDir,vec3 emissive,float metallic_1,float roughness_1,vec3 ao,vec3 specularAO)
{
float l9_0=opacity;
vec3 l9_1=ssSRGB_to_Linear(albedo);
vec3 l9_2=normal;
vec3 l9_3=normalize(l9_2);
vec3 l9_4=position;
vec3 l9_5=viewDir;
vec3 l9_6=ssSRGB_to_Linear(emissive);
float l9_7=metallic_1;
float l9_8=roughness_1;
vec3 l9_9=ao;
vec3 l9_10=specularAO;
vec3 l9_11;
#if (sc_SSAOEnabled)
{
l9_11=evaluateSSAO(l9_4);
}
#else
{
l9_11=l9_9;
}
#endif
vec3 l9_12=vec3(l9_7);
vec3 l9_13=mix(vec3(0.039999999),l9_1*l9_7,l9_12);
vec3 l9_14=mix(l9_1*(1.0-l9_7),vec3(0.0),l9_12);
SurfaceProperties l9_15=SurfaceProperties(l9_14,l9_0,l9_3,l9_4,l9_5,l9_7,l9_8,l9_6,l9_11,l9_10,vec3(1.0),l9_13);
vec4 l9_16=vec4(1.0);
vec3 l9_17;
vec3 l9_18;
vec3 l9_19;
vec3 l9_20;
int l9_21;
vec3 l9_22;
vec3 l9_23;
#if (sc_DirectionalLightsCount>0)
{
vec3 l9_24;
vec3 l9_25;
vec3 l9_26;
vec3 l9_27;
int l9_28;
vec3 l9_29;
vec3 l9_30;
l9_30=vec3(1.0);
l9_29=vec3(0.0);
l9_28=0;
l9_27=vec3(0.0);
l9_26=vec3(0.0);
l9_25=vec3(0.0);
l9_24=vec3(0.0);
LightingComponents l9_31;
LightProperties l9_32;
SurfaceProperties l9_33;
vec3 l9_34;
int l9_35=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_35<sc_DirectionalLightsCount)
{
LightingComponents l9_36=accumulateLight(LightingComponents(l9_24,l9_25,l9_30,l9_29,l9_27,l9_26),LightProperties(sc_DirectionalLights[l9_35].direction,sc_DirectionalLights[l9_35].color.xyz,sc_DirectionalLights[l9_35].color.w*l9_16[(l9_28<3) ? l9_28 : 3]),l9_15,l9_5);
l9_30=l9_36.indirectDiffuse;
l9_29=l9_36.indirectSpecular;
l9_28++;
l9_27=l9_36.emitted;
l9_26=l9_36.transmitted;
l9_25=l9_36.directSpecular;
l9_24=l9_36.directDiffuse;
l9_35++;
continue;
}
else
{
break;
}
}
l9_23=l9_30;
l9_22=l9_29;
l9_21=l9_28;
l9_20=l9_27;
l9_19=l9_26;
l9_18=l9_25;
l9_17=l9_24;
}
#else
{
l9_23=vec3(1.0);
l9_22=vec3(0.0);
l9_21=0;
l9_20=vec3(0.0);
l9_19=vec3(0.0);
l9_18=vec3(0.0);
l9_17=vec3(0.0);
}
#endif
vec3 l9_37;
vec3 l9_38;
vec3 l9_39;
#if (sc_PointLightsCount>0)
{
vec3 l9_40;
vec3 l9_41;
vec3 l9_42;
vec3 l9_43;
vec3 l9_44;
vec3 l9_45;
l9_45=l9_23;
l9_44=l9_22;
l9_43=l9_20;
l9_42=l9_19;
l9_41=l9_18;
l9_40=l9_17;
int l9_46;
vec3 l9_47;
vec3 l9_48;
vec3 l9_49;
vec3 l9_50;
vec3 l9_51;
vec3 l9_52;
int l9_53=0;
int l9_54=l9_21;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_53<sc_PointLightsCount)
{
vec3 l9_55=sc_PointLights[l9_53].position-l9_4;
vec3 l9_56=normalize(l9_55);
float l9_57=l9_16[(l9_54<3) ? l9_54 : 3];
float l9_58=clamp((dot(l9_56,sc_PointLights[l9_53].direction)*sc_PointLights[l9_53].angleScale)+sc_PointLights[l9_53].angleOffset,0.0,1.0);
float l9_59=(sc_PointLights[l9_53].color.w*l9_57)*(l9_58*l9_58);
float l9_60;
if (sc_PointLights[l9_53].falloffEnabled)
{
l9_60=l9_59*computeDistanceAttenuation(length(l9_55),sc_PointLights[l9_53].falloffEndDistance);
}
else
{
l9_60=l9_59;
}
l9_46=l9_54+1;
LightingComponents l9_61=accumulateLight(LightingComponents(l9_40,l9_41,l9_45,l9_44,l9_43,l9_42),LightProperties(l9_56,sc_PointLights[l9_53].color.xyz,l9_60),l9_15,l9_5);
l9_47=l9_61.directDiffuse;
l9_48=l9_61.directSpecular;
l9_49=l9_61.indirectDiffuse;
l9_50=l9_61.indirectSpecular;
l9_51=l9_61.emitted;
l9_52=l9_61.transmitted;
l9_45=l9_49;
l9_44=l9_50;
l9_54=l9_46;
l9_43=l9_51;
l9_42=l9_52;
l9_41=l9_48;
l9_40=l9_47;
l9_53++;
continue;
}
else
{
break;
}
}
l9_39=l9_42;
l9_38=l9_41;
l9_37=l9_40;
}
#else
{
l9_39=l9_19;
l9_38=l9_18;
l9_37=l9_17;
}
#endif
vec3 l9_62;
vec3 l9_63;
#if (sc_ProjectiveShadowsReceiver)
{
vec3 l9_64;
#if (sc_ProjectiveShadowsReceiver)
{
vec2 l9_65=abs(varShadowTex-vec2(0.5));
vec4 l9_66=texture(sc_ShadowTexture,varShadowTex)*step(max(l9_65.x,l9_65.y),0.5);
l9_64=mix(vec3(1.0),mix(sc_ShadowColor.xyz,sc_ShadowColor.xyz*l9_66.xyz,vec3(sc_ShadowColor.w)),vec3(l9_66.w*sc_ShadowDensity));
}
#else
{
l9_64=vec3(1.0);
}
#endif
l9_63=l9_38*l9_64;
l9_62=l9_37*l9_64;
}
#else
{
l9_63=l9_38;
l9_62=l9_37;
}
#endif
vec3 l9_67;
vec3 l9_68;
if (receivesRayTracedShadows)
{
vec2 l9_69=gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw;
int l9_70;
#if (sc_RayTracedShadowTextureHasSwappedViews)
{
l9_70=1-sc_GetStereoViewIndex();
}
#else
{
l9_70=sc_GetStereoViewIndex();
}
#endif
vec4 l9_71;
#if (sc_RayTracedShadowTextureLayout==2)
{
l9_71=texture(sc_RayTracedShadowTextureArrSC,sc_SamplingCoordsViewToGlobal(l9_69,sc_RayTracedShadowTextureLayout,l9_70),0.0);
}
#else
{
l9_71=texture(sc_RayTracedShadowTexture,sc_SamplingCoordsViewToGlobal(l9_69,sc_RayTracedShadowTextureLayout,l9_70).xy,0.0);
}
#endif
vec3 l9_72=vec3(1.0)-vec3(l9_71.x);
l9_68=l9_62*l9_72;
l9_67=l9_63*l9_72;
}
else
{
l9_68=l9_62;
l9_67=l9_63;
}
vec3 l9_73;
#if ((sc_EnvLightMode==sc_AmbientLightMode_EnvironmentMap)||(sc_EnvLightMode==sc_AmbientLightMode_FromCamera))
{
vec2 l9_74=calcPanoramicTexCoordsFromDir(l9_3,sc_EnvmapRotation.y);
vec4 l9_75;
#if (sc_EnvLightMode==sc_AmbientLightMode_FromCamera)
{
vec2 l9_76;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
l9_76=calcSeamlessPanoramicUvsForSampling(l9_74,sc_EnvmapSpecularSize.xy,5.0);
}
#else
{
l9_76=l9_74;
}
#endif
l9_75=sc_EnvmapSpecularSampleViewIndexBias(l9_76,sc_EnvmapSpecularGetStereoViewIndex(),13.0);
}
#else
{
vec4 l9_77;
#if ((sc_MaxTextureImageUnits>8)&&sc_HasDiffuseEnvmap)
{
vec2 l9_78=calcSeamlessPanoramicUvsForSampling(l9_74,sc_EnvmapDiffuseSize.xy,0.0);
vec4 l9_79;
if (isProxyMode)
{
int l9_80=sc_EnvmapDiffuseGetStereoViewIndex();
vec4 l9_81;
#if (sc_CanUseTextureLod)
{
vec4 l9_82;
#if (sc_EnvmapDiffuseLayout==2)
{
vec3 l9_83=sc_SamplingCoordsViewToGlobal(l9_78,sc_EnvmapDiffuseLayout,l9_80);
vec4 l9_84;
#if (sc_CanUseTextureLod)
{
l9_84=textureLod(sc_EnvmapDiffuseArrSC,l9_83,0.0);
}
#else
{
l9_84=vec4(0.0);
}
#endif
l9_82=l9_84;
}
#else
{
l9_82=textureLod(sc_EnvmapDiffuse,sc_SamplingCoordsViewToGlobal(l9_78,sc_EnvmapDiffuseLayout,l9_80).xy,0.0);
}
#endif
l9_81=l9_82;
}
#else
{
l9_81=vec4(0.0);
}
#endif
l9_79=l9_81;
}
else
{
int l9_85=sc_EnvmapDiffuseGetStereoViewIndex();
vec4 l9_86;
#if (sc_EnvmapDiffuseLayout==2)
{
l9_86=texture(sc_EnvmapDiffuseArrSC,sc_SamplingCoordsViewToGlobal(l9_78,sc_EnvmapDiffuseLayout,l9_85),-13.0);
}
#else
{
l9_86=texture(sc_EnvmapDiffuse,sc_SamplingCoordsViewToGlobal(l9_78,sc_EnvmapDiffuseLayout,l9_85).xy,-13.0);
}
#endif
l9_79=l9_86;
}
l9_77=l9_79;
}
#else
{
l9_77=sc_EnvmapSpecularSampleViewIndexBias(l9_74,sc_EnvmapSpecularGetStereoViewIndex(),13.0);
}
#endif
l9_75=l9_77;
}
#endif
l9_73=(l9_75.xyz*(1.0/l9_75.w))*sc_EnvmapExposure;
}
#else
{
vec3 l9_87;
#if (sc_EnvLightMode==sc_AmbientLightMode_SphericalHarmonics)
{
vec3 l9_88=-l9_3;
float l9_89=l9_88.x;
float l9_90=l9_88.y;
float l9_91=l9_88.z;
l9_87=(((((((sc_Sh[8]*0.42904299)*((l9_89*l9_89)-(l9_90*l9_90)))+((sc_Sh[6]*0.74312502)*(l9_91*l9_91)))+(sc_Sh[0]*0.88622701))-(sc_Sh[6]*0.24770799))+((((sc_Sh[4]*(l9_89*l9_90))+(sc_Sh[7]*(l9_89*l9_91)))+(sc_Sh[5]*(l9_90*l9_91)))*0.85808599))+((((sc_Sh[3]*l9_89)+(sc_Sh[1]*l9_90))+(sc_Sh[2]*l9_91))*1.0233279))*sc_ShIntensity;
}
#else
{
l9_87=vec3(0.0);
}
#endif
l9_73=l9_87;
}
#endif
vec3 l9_92;
if (receivesRayTracedDiffuseIndirect)
{
vec4 l9_93=sampleRayTracedIndirectDiffuse();
l9_92=mix(l9_73,l9_93.xyz,vec3(l9_93.w));
}
else
{
l9_92=l9_73;
}
vec3 l9_94;
#if (sc_AmbientLightsCount>0)
{
vec3 l9_95;
#if (sc_AmbientLightMode0==sc_AmbientLightMode_Constant)
{
l9_95=l9_92+(sc_AmbientLights[0].color*sc_AmbientLights[0].intensity);
}
#else
{
vec3 l9_96=l9_92;
l9_96.x=l9_92.x+(1e-06*sc_AmbientLights[0].color.x);
l9_95=l9_96;
}
#endif
l9_94=l9_95;
}
#else
{
l9_94=l9_92;
}
#endif
vec3 l9_97;
#if (sc_AmbientLightsCount>1)
{
vec3 l9_98;
#if (sc_AmbientLightMode1==sc_AmbientLightMode_Constant)
{
l9_98=l9_94+(sc_AmbientLights[1].color*sc_AmbientLights[1].intensity);
}
#else
{
vec3 l9_99=l9_94;
l9_99.x=l9_94.x+(1e-06*sc_AmbientLights[1].color.x);
l9_98=l9_99;
}
#endif
l9_97=l9_98;
}
#else
{
l9_97=l9_94;
}
#endif
vec3 l9_100;
#if (sc_AmbientLightsCount>2)
{
vec3 l9_101;
#if (sc_AmbientLightMode2==sc_AmbientLightMode_Constant)
{
l9_101=l9_97+(sc_AmbientLights[2].color*sc_AmbientLights[2].intensity);
}
#else
{
vec3 l9_102=l9_97;
l9_102.x=l9_97.x+(1e-06*sc_AmbientLights[2].color.x);
l9_101=l9_102;
}
#endif
l9_100=l9_101;
}
#else
{
l9_100=l9_97;
}
#endif
vec3 l9_103;
#if (sc_LightEstimation)
{
vec3 l9_104;
l9_104=sc_LightEstimationData.ambientLight;
vec3 l9_105;
int l9_106=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_106<sc_LightEstimationSGCount)
{
float l9_107=dot(sc_LightEstimationData.sg[l9_106].axis,l9_3);
float l9_108=exp(-sc_LightEstimationData.sg[l9_106].sharpness);
float l9_109=l9_108*l9_108;
float l9_110=1.0/sc_LightEstimationData.sg[l9_106].sharpness;
float l9_111=(1.0+(2.0*l9_109))-l9_110;
float l9_112=sqrt(1.0-l9_111);
float l9_113=0.36000001*l9_107;
float l9_114=(1.0/(4.0*0.36000001))*l9_112;
float l9_115=l9_113+l9_114;
float l9_116;
if (step(abs(l9_113),l9_114)>0.5)
{
l9_116=(l9_115*l9_115)/l9_112;
}
else
{
l9_116=clamp(l9_107,0.0,1.0);
}
l9_105=l9_104+((((sc_LightEstimationData.sg[l9_106].color/vec3(sc_LightEstimationData.sg[l9_106].sharpness))*6.2831855)*((l9_111*l9_116)+(((l9_108-l9_109)*l9_110)-l9_109)))/vec3(3.1415927));
l9_104=l9_105;
l9_106++;
continue;
}
else
{
break;
}
}
l9_103=l9_100+l9_104;
}
#else
{
l9_103=l9_100;
}
#endif
vec3 l9_117;
#if ((sc_EnvLightMode==sc_AmbientLightMode_EnvironmentMap)||(sc_EnvLightMode==sc_AmbientLightMode_FromCamera))
{
float l9_118=clamp(pow(l9_8,0.66666669),0.0,1.0)*5.0;
vec2 l9_119=calcPanoramicTexCoordsFromDir(getSpecularDominantDir(l9_3,reflect(-l9_5,l9_3),l9_8),sc_EnvmapRotation.y);
vec4 l9_120;
#if ((SC_DEVICE_CLASS>=2)&&SC_GL_FRAGMENT_PRECISION_HIGH)
{
float l9_121=floor(l9_118);
float l9_122=ceil(l9_118);
l9_120=mix(sc_EnvmapSpecularSampleViewIndexLevel(calcSeamlessPanoramicUvsForSampling(l9_119,sc_EnvmapSpecularSize.xy,l9_121),sc_EnvmapSpecularGetStereoViewIndex(),l9_121),sc_EnvmapSpecularSampleViewIndexLevel(calcSeamlessPanoramicUvsForSampling(l9_119,sc_EnvmapSpecularSize.xy,l9_122),sc_EnvmapSpecularGetStereoViewIndex(),l9_122),vec4(l9_118-l9_121));
}
#else
{
l9_120=sc_EnvmapSpecularSampleViewIndexLevel(l9_119,sc_EnvmapSpecularGetStereoViewIndex(),l9_118);
}
#endif
vec3 l9_123=((l9_120.xyz*(1.0/l9_120.w))*sc_EnvmapExposure)+vec3(1e-06);
vec3 l9_124;
if (receivesRayTracedReflections)
{
vec4 l9_125=sampleRayTracedReflections();
l9_124=mix(l9_123,l9_125.xyz,vec3(l9_125.w));
}
else
{
l9_124=l9_123;
}
l9_117=vec3(0.0)+(l9_124*envBRDFApprox(l9_15,abs(dot(l9_3,l9_5))));
}
#else
{
l9_117=vec3(0.0);
}
#endif
vec3 l9_126;
#if (sc_LightEstimation)
{
float l9_127=clamp(l9_8*l9_8,0.0099999998,1.0);
vec3 l9_128;
l9_128=sc_LightEstimationData.ambientLight*l9_13;
int l9_129=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_129<sc_LightEstimationSGCount)
{
float l9_130=l9_127*l9_127;
vec3 l9_131=reflect(-l9_5,l9_3);
float l9_132=dot(l9_3,l9_5);
float l9_133=(2.0/l9_130)/(4.0*max(l9_132,9.9999997e-05));
float l9_134=length((l9_131*l9_133)+(sc_LightEstimationData.sg[l9_129].axis*sc_LightEstimationData.sg[l9_129].sharpness));
float l9_135=clamp(dot(l9_3,l9_131),0.0,1.0);
float l9_136=clamp(l9_132,0.0,1.0);
float l9_137=1.0-l9_130;
l9_128+=((((((((vec3(1.0/(3.1415927*l9_130))*exp((l9_134-l9_133)-sc_LightEstimationData.sg[l9_129].sharpness))*sc_LightEstimationData.sg[l9_129].color)*6.2831855)*(1.0-exp((-2.0)*l9_134)))/vec3(l9_134))*((1.0/(l9_135+sqrt(l9_130+((l9_137*l9_135)*l9_135))))*(1.0/(l9_136+sqrt(l9_130+((l9_137*l9_136)*l9_136))))))*(l9_13+((vec3(1.0)-l9_13)*pow(1.0-clamp(dot(l9_131,normalize(l9_131+l9_5)),0.0,1.0),5.0))))*l9_135);
l9_129++;
continue;
}
else
{
break;
}
}
l9_126=l9_117+l9_128;
}
#else
{
l9_126=l9_117;
}
#endif
float l9_138;
vec3 l9_139;
vec3 l9_140;
vec3 l9_141;
#if (sc_BlendMode_ColoredGlass)
{
l9_141=vec3(0.0);
l9_140=vec3(0.0);
l9_139=ssSRGB_to_Linear(sc_GetFramebufferColor().xyz)*mix(vec3(1.0),l9_14,vec3(l9_0));
l9_138=1.0;
}
#else
{
l9_141=l9_68;
l9_140=l9_103;
l9_139=l9_39;
l9_138=l9_0;
}
#endif
bool l9_142;
#if (sc_BlendMode_PremultipliedAlpha)
{
l9_142=true;
}
#else
{
l9_142=false;
}
#endif
vec3 l9_143;
if (receivesRayTracedAo)
{
l9_143=l9_14*(l9_141+(l9_140*vec3(1.0-sampleRayTracedAo())));
}
else
{
l9_143=l9_14*(l9_141+(l9_140*l9_11));
}
vec3 l9_144=l9_126*l9_10;
vec3 l9_145=l9_67+l9_144;
vec3 l9_146;
if (l9_142)
{
l9_146=l9_143*srgbToLinear(l9_138);
}
else
{
l9_146=l9_143;
}
vec3 l9_147=l9_146+l9_145;
vec3 l9_148=(l9_147+l9_6)+l9_139;
float l9_149=l9_148.x;
vec4 l9_150=vec4(l9_149,l9_148.yz,l9_138);
vec4 l9_151;
#if (sc_IsEditor)
{
vec4 l9_152=l9_150;
l9_152.x=l9_149+((l9_11.x*l9_10.x)*9.9999997e-06);
l9_151=l9_152;
}
#else
{
l9_151=l9_150;
}
#endif
if (isProxyMode)
{
return l9_151;
}
vec4 l9_153;
#if (!sc_BlendMode_Multiply)
{
vec3 l9_154=l9_151.xyz*1.8;
vec3 l9_155=(l9_151.xyz*(l9_154+vec3(1.4)))/((l9_151.xyz*(l9_154+vec3(0.5)))+vec3(1.5));
l9_153=vec4(l9_155.x,l9_155.y,l9_155.z,l9_151.w);
}
#else
{
l9_153=l9_151;
}
#endif
vec3 l9_156=vec3(linearToSrgb(l9_153.x),linearToSrgb(l9_153.y),linearToSrgb(l9_153.z));
return vec4(l9_156.x,l9_156.y,l9_156.z,l9_153.w);
}
void sc_writeFragData0(vec4 col)
{
    col.x+=sc_UniformConstants.x*float(sc_ShaderCacheConstant);
    sc_FragData0=col;
}
int intensityTextureGetStereoViewIndex()
{
int l9_0;
#if (intensityTextureHasSwappedViews)
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
float l9_48=pow(l9_47,1.0/correctedIntensity);
vec4 l9_49;
#if (intensityTextureLayout==2)
{
float l9_50=l9_48;
sc_SoftwareWrapEarly(l9_50,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x);
float l9_51=l9_50;
float l9_52=0.5;
sc_SoftwareWrapEarly(l9_52,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y);
float l9_53=l9_52;
vec2 l9_54;
float l9_55;
#if (SC_USE_UV_MIN_MAX_intensityTexture)
{
bool l9_56;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_56=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x==3;
}
#else
{
l9_56=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_57=l9_51;
float l9_58=1.0;
sc_ClampUV(l9_57,intensityTextureUvMinMax.x,intensityTextureUvMinMax.z,l9_56,l9_58);
float l9_59=l9_57;
float l9_60=l9_58;
bool l9_61;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_61=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y==3;
}
#else
{
l9_61=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_62=l9_53;
float l9_63=l9_60;
sc_ClampUV(l9_62,intensityTextureUvMinMax.y,intensityTextureUvMinMax.w,l9_61,l9_63);
l9_55=l9_63;
l9_54=vec2(l9_59,l9_62);
}
#else
{
l9_55=1.0;
l9_54=vec2(l9_51,l9_53);
}
#endif
vec2 l9_64=sc_TransformUV(l9_54,(int(SC_USE_UV_TRANSFORM_intensityTexture)!=0),intensityTextureTransform);
float l9_65=l9_64.x;
float l9_66=l9_55;
sc_SoftwareWrapLate(l9_65,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x,(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_intensityTexture)!=0)),l9_66);
float l9_67=l9_64.y;
float l9_68=l9_66;
sc_SoftwareWrapLate(l9_67,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y,(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_intensityTexture)!=0)),l9_68);
float l9_69=l9_68;
vec3 l9_70=sc_SamplingCoordsViewToGlobal(vec2(l9_65,l9_67),intensityTextureLayout,intensityTextureGetStereoViewIndex());
vec4 l9_71=texture(intensityTextureArrSC,l9_70,0.0);
vec4 l9_72;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_72=mix(intensityTextureBorderColor,l9_71,vec4(l9_69));
}
#else
{
l9_72=l9_71;
}
#endif
l9_49=l9_72;
}
#else
{
float l9_73=l9_48;
sc_SoftwareWrapEarly(l9_73,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x);
float l9_74=l9_73;
float l9_75=0.5;
sc_SoftwareWrapEarly(l9_75,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y);
float l9_76=l9_75;
vec2 l9_77;
float l9_78;
#if (SC_USE_UV_MIN_MAX_intensityTexture)
{
bool l9_79;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_79=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x==3;
}
#else
{
l9_79=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_80=l9_74;
float l9_81=1.0;
sc_ClampUV(l9_80,intensityTextureUvMinMax.x,intensityTextureUvMinMax.z,l9_79,l9_81);
float l9_82=l9_80;
float l9_83=l9_81;
bool l9_84;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_84=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y==3;
}
#else
{
l9_84=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_85=l9_76;
float l9_86=l9_83;
sc_ClampUV(l9_85,intensityTextureUvMinMax.y,intensityTextureUvMinMax.w,l9_84,l9_86);
l9_78=l9_86;
l9_77=vec2(l9_82,l9_85);
}
#else
{
l9_78=1.0;
l9_77=vec2(l9_74,l9_76);
}
#endif
vec2 l9_87=sc_TransformUV(l9_77,(int(SC_USE_UV_TRANSFORM_intensityTexture)!=0),intensityTextureTransform);
float l9_88=l9_87.x;
float l9_89=l9_78;
sc_SoftwareWrapLate(l9_88,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x,(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_intensityTexture)!=0)),l9_89);
float l9_90=l9_87.y;
float l9_91=l9_89;
sc_SoftwareWrapLate(l9_90,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y,(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_intensityTexture)!=0)),l9_91);
float l9_92=l9_91;
vec3 l9_93=sc_SamplingCoordsViewToGlobal(vec2(l9_88,l9_90),intensityTextureLayout,intensityTextureGetStereoViewIndex());
vec4 l9_94=texture(intensityTexture,l9_93.xy,0.0);
vec4 l9_95;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_95=mix(intensityTextureBorderColor,l9_94,vec4(l9_92));
}
#else
{
l9_95=l9_94;
}
#endif
l9_49=l9_95;
}
#endif
float l9_96=((((l9_49.x*256.0)+l9_49.y)+(l9_49.z/256.0))/257.00391)*16.0;
float l9_97;
#if (BLEND_MODE_FORGRAY)
{
l9_97=max(l9_96,1.0);
}
#else
{
l9_97=l9_96;
}
#endif
float l9_98;
#if (BLEND_MODE_NOTBRIGHT)
{
l9_98=min(l9_97,1.0);
}
#else
{
l9_98=l9_97;
}
#endif
return transformColor(l9_47,l9_45,l9_46,1.0,l9_98);
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
N7_EnableUV2=false;
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
vec2 l9_3;
vec4 l9_4;
vec2 l9_5;
vec2 l9_6;
vec3 l9_7;
vec3 l9_8;
vec3 l9_9;
vec3 l9_10;
vec3 l9_11;
if (isProxyMode)
{
RayHitPayload l9_12=GetHitData(ivec2(gl_FragCoord.xy));
vec3 l9_13=l9_12.positionWS;
vec3 l9_14=l9_12.normalWS;
vec4 l9_15=l9_12.tangentWS;
if (noEarlyZ)
{
if (l9_12.id.x!=uint(instance_id))
{
return;
}
}
vec3 l9_16=l9_15.xyz;
vec4 l9_17=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(l9_13,1.0);
l9_11=l9_12.viewDirWS;
l9_10=l9_13;
l9_9=l9_14;
l9_8=l9_16;
l9_7=cross(l9_14,l9_16)*l9_15.w;
l9_6=l9_12.uv0;
l9_5=l9_12.uv1;
l9_4=l9_12.color;
l9_3=((l9_17.xy/vec2(l9_17.w))*0.5)+vec2(0.5);
}
else
{
vec3 l9_18=normalize(varNormal);
vec3 l9_19=normalize(varTangent.xyz);
l9_11=normalize(sc_Camera.position-varPos);
l9_10=varPos;
l9_9=l9_18;
l9_8=l9_19;
l9_7=cross(l9_18,l9_19)*varTangent.w;
l9_6=varPackedTex.xy;
l9_5=varPackedTex.zw;
l9_4=varColor;
l9_3=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
}
tempGlobals=ssGlobals(l9_1,l9_2,0.0,vec2(0.0),vec2(0.0),vec3(0.0),l9_11,l9_10,l9_9,l9_8,l9_7,l9_6,l9_5,l9_4,l9_3,l9_10);
N7_EnableUV2=(int(ENABLE_UV2)!=0);
tempGlobals.N7_TransformedUV2=N7_gettransformUV(NODE_13_DROPLIST_ITEM,uv2Scale,uv2Offset,(int(uv2EnableAnimation)!=0),N7_EnableUV2);
tempGlobals.N7_TransformedUV3=N7_gettransformUV(NODE_49_DROPLIST_ITEM,uv3Scale,uv3Offset,(int(uv3EnableAnimation)!=0),(int(ENABLE_UV3)!=0));
vec4 l9_20;
#if (ENABLE_BASE_TEX)
{
vec2 l9_21=N7_getUV(NODE_27_DROPLIST_ITEM);
vec4 l9_22;
#if (baseTexLayout==2)
{
float l9_23=l9_21.x;
sc_SoftwareWrapEarly(l9_23,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x);
float l9_24=l9_23;
float l9_25=l9_21.y;
sc_SoftwareWrapEarly(l9_25,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y);
float l9_26=l9_25;
vec2 l9_27;
float l9_28;
#if (SC_USE_UV_MIN_MAX_baseTex)
{
bool l9_29;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_29=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x==3;
}
#else
{
l9_29=(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0);
}
#endif
float l9_30=l9_24;
float l9_31=1.0;
sc_ClampUV(l9_30,baseTexUvMinMax.x,baseTexUvMinMax.z,l9_29,l9_31);
float l9_32=l9_30;
float l9_33=l9_31;
bool l9_34;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_34=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y==3;
}
#else
{
l9_34=(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0);
}
#endif
float l9_35=l9_26;
float l9_36=l9_33;
sc_ClampUV(l9_35,baseTexUvMinMax.y,baseTexUvMinMax.w,l9_34,l9_36);
l9_28=l9_36;
l9_27=vec2(l9_32,l9_35);
}
#else
{
l9_28=1.0;
l9_27=vec2(l9_24,l9_26);
}
#endif
vec2 l9_37=sc_TransformUV(l9_27,(int(SC_USE_UV_TRANSFORM_baseTex)!=0),baseTexTransform);
float l9_38=l9_37.x;
float l9_39=l9_28;
sc_SoftwareWrapLate(l9_38,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x,(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex)!=0)),l9_39);
float l9_40=l9_37.y;
float l9_41=l9_39;
sc_SoftwareWrapLate(l9_40,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y,(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex)!=0)),l9_41);
float l9_42=l9_41;
vec3 l9_43=sc_SamplingCoordsViewToGlobal(vec2(l9_38,l9_40),baseTexLayout,baseTexGetStereoViewIndex());
vec4 l9_44=texture(baseTexArrSC,l9_43,0.0);
vec4 l9_45;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_45=mix(baseTexBorderColor,l9_44,vec4(l9_42));
}
#else
{
l9_45=l9_44;
}
#endif
l9_22=l9_45;
}
#else
{
float l9_46=l9_21.x;
sc_SoftwareWrapEarly(l9_46,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x);
float l9_47=l9_46;
float l9_48=l9_21.y;
sc_SoftwareWrapEarly(l9_48,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y);
float l9_49=l9_48;
vec2 l9_50;
float l9_51;
#if (SC_USE_UV_MIN_MAX_baseTex)
{
bool l9_52;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_52=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x==3;
}
#else
{
l9_52=(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0);
}
#endif
float l9_53=l9_47;
float l9_54=1.0;
sc_ClampUV(l9_53,baseTexUvMinMax.x,baseTexUvMinMax.z,l9_52,l9_54);
float l9_55=l9_53;
float l9_56=l9_54;
bool l9_57;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_57=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y==3;
}
#else
{
l9_57=(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0);
}
#endif
float l9_58=l9_49;
float l9_59=l9_56;
sc_ClampUV(l9_58,baseTexUvMinMax.y,baseTexUvMinMax.w,l9_57,l9_59);
l9_51=l9_59;
l9_50=vec2(l9_55,l9_58);
}
#else
{
l9_51=1.0;
l9_50=vec2(l9_47,l9_49);
}
#endif
vec2 l9_60=sc_TransformUV(l9_50,(int(SC_USE_UV_TRANSFORM_baseTex)!=0),baseTexTransform);
float l9_61=l9_60.x;
float l9_62=l9_51;
sc_SoftwareWrapLate(l9_61,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).x,(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex)!=0)),l9_62);
float l9_63=l9_60.y;
float l9_64=l9_62;
sc_SoftwareWrapLate(l9_63,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex,SC_SOFTWARE_WRAP_MODE_V_baseTex).y,(int(SC_USE_CLAMP_TO_BORDER_baseTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex)!=0)),l9_64);
float l9_65=l9_64;
vec3 l9_66=sc_SamplingCoordsViewToGlobal(vec2(l9_61,l9_63),baseTexLayout,baseTexGetStereoViewIndex());
vec4 l9_67=texture(baseTex,l9_66.xy,0.0);
vec4 l9_68;
#if (SC_USE_CLAMP_TO_BORDER_baseTex)
{
l9_68=mix(baseTexBorderColor,l9_67,vec4(l9_65));
}
#else
{
l9_68=l9_67;
}
#endif
l9_22=l9_68;
}
#endif
l9_20=baseColor*l9_22;
}
#else
{
l9_20=baseColor;
}
#endif
vec4 l9_69;
#if (ENABLE_RECOLOR)
{
vec3 l9_70=((recolorRed*l9_20.x)+(recolorGreen*l9_20.y))+(recolorBlue*l9_20.z);
l9_69=vec4(l9_70.x,l9_70.y,l9_70.z,l9_20.w);
}
#else
{
l9_69=l9_20;
}
#endif
float l9_71;
#if (ENABLE_OPACITY_TEX)
{
vec2 l9_72=N7_getUV(NODE_69_DROPLIST_ITEM);
vec4 l9_73;
#if (opacityTexLayout==2)
{
float l9_74=l9_72.x;
sc_SoftwareWrapEarly(l9_74,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x);
float l9_75=l9_74;
float l9_76=l9_72.y;
sc_SoftwareWrapEarly(l9_76,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y);
float l9_77=l9_76;
vec2 l9_78;
float l9_79;
#if (SC_USE_UV_MIN_MAX_opacityTex)
{
bool l9_80;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_80=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x==3;
}
#else
{
l9_80=(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0);
}
#endif
float l9_81=l9_75;
float l9_82=1.0;
sc_ClampUV(l9_81,opacityTexUvMinMax.x,opacityTexUvMinMax.z,l9_80,l9_82);
float l9_83=l9_81;
float l9_84=l9_82;
bool l9_85;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_85=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y==3;
}
#else
{
l9_85=(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0);
}
#endif
float l9_86=l9_77;
float l9_87=l9_84;
sc_ClampUV(l9_86,opacityTexUvMinMax.y,opacityTexUvMinMax.w,l9_85,l9_87);
l9_79=l9_87;
l9_78=vec2(l9_83,l9_86);
}
#else
{
l9_79=1.0;
l9_78=vec2(l9_75,l9_77);
}
#endif
vec2 l9_88=sc_TransformUV(l9_78,(int(SC_USE_UV_TRANSFORM_opacityTex)!=0),opacityTexTransform);
float l9_89=l9_88.x;
float l9_90=l9_79;
sc_SoftwareWrapLate(l9_89,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x,(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTex)!=0)),l9_90);
float l9_91=l9_88.y;
float l9_92=l9_90;
sc_SoftwareWrapLate(l9_91,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y,(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTex)!=0)),l9_92);
float l9_93=l9_92;
vec3 l9_94=sc_SamplingCoordsViewToGlobal(vec2(l9_89,l9_91),opacityTexLayout,opacityTexGetStereoViewIndex());
vec4 l9_95=texture(opacityTexArrSC,l9_94,0.0);
vec4 l9_96;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_96=mix(opacityTexBorderColor,l9_95,vec4(l9_93));
}
#else
{
l9_96=l9_95;
}
#endif
l9_73=l9_96;
}
#else
{
float l9_97=l9_72.x;
sc_SoftwareWrapEarly(l9_97,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x);
float l9_98=l9_97;
float l9_99=l9_72.y;
sc_SoftwareWrapEarly(l9_99,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y);
float l9_100=l9_99;
vec2 l9_101;
float l9_102;
#if (SC_USE_UV_MIN_MAX_opacityTex)
{
bool l9_103;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_103=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x==3;
}
#else
{
l9_103=(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0);
}
#endif
float l9_104=l9_98;
float l9_105=1.0;
sc_ClampUV(l9_104,opacityTexUvMinMax.x,opacityTexUvMinMax.z,l9_103,l9_105);
float l9_106=l9_104;
float l9_107=l9_105;
bool l9_108;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_108=ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y==3;
}
#else
{
l9_108=(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0);
}
#endif
float l9_109=l9_100;
float l9_110=l9_107;
sc_ClampUV(l9_109,opacityTexUvMinMax.y,opacityTexUvMinMax.w,l9_108,l9_110);
l9_102=l9_110;
l9_101=vec2(l9_106,l9_109);
}
#else
{
l9_102=1.0;
l9_101=vec2(l9_98,l9_100);
}
#endif
vec2 l9_111=sc_TransformUV(l9_101,(int(SC_USE_UV_TRANSFORM_opacityTex)!=0),opacityTexTransform);
float l9_112=l9_111.x;
float l9_113=l9_102;
sc_SoftwareWrapLate(l9_112,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).x,(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTex)!=0)),l9_113);
float l9_114=l9_111.y;
float l9_115=l9_113;
sc_SoftwareWrapLate(l9_114,ivec2(SC_SOFTWARE_WRAP_MODE_U_opacityTex,SC_SOFTWARE_WRAP_MODE_V_opacityTex).y,(int(SC_USE_CLAMP_TO_BORDER_opacityTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_opacityTex)!=0)),l9_115);
float l9_116=l9_115;
vec3 l9_117=sc_SamplingCoordsViewToGlobal(vec2(l9_112,l9_114),opacityTexLayout,opacityTexGetStereoViewIndex());
vec4 l9_118=texture(opacityTex,l9_117.xy,0.0);
vec4 l9_119;
#if (SC_USE_CLAMP_TO_BORDER_opacityTex)
{
l9_119=mix(opacityTexBorderColor,l9_118,vec4(l9_116));
}
#else
{
l9_119=l9_118;
}
#endif
l9_73=l9_119;
}
#endif
l9_71=l9_73.x;
}
#else
{
l9_71=1.0;
}
#endif
float l9_120=l9_71*l9_69.w;
vec4 l9_121;
float l9_122;
#if (NODE_38_DROPLIST_ITEM==1)
{
l9_122=l9_120*tempGlobals.VertexColor.w;
l9_121=l9_69*tempGlobals.VertexColor;
}
#else
{
l9_122=l9_120;
l9_121=l9_69;
}
#endif
vec3 l9_123;
#if (ENABLE_NORMALMAP)
{
vec2 l9_124=N7_getUV(NODE_181_DROPLIST_ITEM);
vec4 l9_125;
#if (normalTexLayout==2)
{
float l9_126=l9_124.x;
sc_SoftwareWrapEarly(l9_126,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x);
float l9_127=l9_126;
float l9_128=l9_124.y;
sc_SoftwareWrapEarly(l9_128,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y);
float l9_129=l9_128;
vec2 l9_130;
float l9_131;
#if (SC_USE_UV_MIN_MAX_normalTex)
{
bool l9_132;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_132=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x==3;
}
#else
{
l9_132=(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0);
}
#endif
float l9_133=l9_127;
float l9_134=1.0;
sc_ClampUV(l9_133,normalTexUvMinMax.x,normalTexUvMinMax.z,l9_132,l9_134);
float l9_135=l9_133;
float l9_136=l9_134;
bool l9_137;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_137=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y==3;
}
#else
{
l9_137=(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0);
}
#endif
float l9_138=l9_129;
float l9_139=l9_136;
sc_ClampUV(l9_138,normalTexUvMinMax.y,normalTexUvMinMax.w,l9_137,l9_139);
l9_131=l9_139;
l9_130=vec2(l9_135,l9_138);
}
#else
{
l9_131=1.0;
l9_130=vec2(l9_127,l9_129);
}
#endif
vec2 l9_140=sc_TransformUV(l9_130,(int(SC_USE_UV_TRANSFORM_normalTex)!=0),normalTexTransform);
float l9_141=l9_140.x;
float l9_142=l9_131;
sc_SoftwareWrapLate(l9_141,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x,(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTex)!=0)),l9_142);
float l9_143=l9_140.y;
float l9_144=l9_142;
sc_SoftwareWrapLate(l9_143,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y,(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTex)!=0)),l9_144);
float l9_145=l9_144;
vec3 l9_146=sc_SamplingCoordsViewToGlobal(vec2(l9_141,l9_143),normalTexLayout,normalTexGetStereoViewIndex());
vec4 l9_147=texture(normalTexArrSC,l9_146,0.0);
vec4 l9_148;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_148=mix(normalTexBorderColor,l9_147,vec4(l9_145));
}
#else
{
l9_148=l9_147;
}
#endif
l9_125=l9_148;
}
#else
{
float l9_149=l9_124.x;
sc_SoftwareWrapEarly(l9_149,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x);
float l9_150=l9_149;
float l9_151=l9_124.y;
sc_SoftwareWrapEarly(l9_151,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y);
float l9_152=l9_151;
vec2 l9_153;
float l9_154;
#if (SC_USE_UV_MIN_MAX_normalTex)
{
bool l9_155;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_155=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x==3;
}
#else
{
l9_155=(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0);
}
#endif
float l9_156=l9_150;
float l9_157=1.0;
sc_ClampUV(l9_156,normalTexUvMinMax.x,normalTexUvMinMax.z,l9_155,l9_157);
float l9_158=l9_156;
float l9_159=l9_157;
bool l9_160;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_160=ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y==3;
}
#else
{
l9_160=(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0);
}
#endif
float l9_161=l9_152;
float l9_162=l9_159;
sc_ClampUV(l9_161,normalTexUvMinMax.y,normalTexUvMinMax.w,l9_160,l9_162);
l9_154=l9_162;
l9_153=vec2(l9_158,l9_161);
}
#else
{
l9_154=1.0;
l9_153=vec2(l9_150,l9_152);
}
#endif
vec2 l9_163=sc_TransformUV(l9_153,(int(SC_USE_UV_TRANSFORM_normalTex)!=0),normalTexTransform);
float l9_164=l9_163.x;
float l9_165=l9_154;
sc_SoftwareWrapLate(l9_164,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).x,(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTex)!=0)),l9_165);
float l9_166=l9_163.y;
float l9_167=l9_165;
sc_SoftwareWrapLate(l9_166,ivec2(SC_SOFTWARE_WRAP_MODE_U_normalTex,SC_SOFTWARE_WRAP_MODE_V_normalTex).y,(int(SC_USE_CLAMP_TO_BORDER_normalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_normalTex)!=0)),l9_167);
float l9_168=l9_167;
vec3 l9_169=sc_SamplingCoordsViewToGlobal(vec2(l9_164,l9_166),normalTexLayout,normalTexGetStereoViewIndex());
vec4 l9_170=texture(normalTex,l9_169.xy,0.0);
vec4 l9_171;
#if (SC_USE_CLAMP_TO_BORDER_normalTex)
{
l9_171=mix(normalTexBorderColor,l9_170,vec4(l9_168));
}
#else
{
l9_171=l9_170;
}
#endif
l9_125=l9_171;
}
#endif
vec3 l9_172;
#if (ENABLE_DETAIL_NORMAL)
{
vec2 l9_173=N7_getUV(NODE_184_DROPLIST_ITEM);
vec4 l9_174;
#if (detailNormalTexLayout==2)
{
float l9_175=l9_173.x;
sc_SoftwareWrapEarly(l9_175,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x);
float l9_176=l9_175;
float l9_177=l9_173.y;
sc_SoftwareWrapEarly(l9_177,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y);
float l9_178=l9_177;
vec2 l9_179;
float l9_180;
#if (SC_USE_UV_MIN_MAX_detailNormalTex)
{
bool l9_181;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_181=ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x==3;
}
#else
{
l9_181=(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0);
}
#endif
float l9_182=l9_176;
float l9_183=1.0;
sc_ClampUV(l9_182,detailNormalTexUvMinMax.x,detailNormalTexUvMinMax.z,l9_181,l9_183);
float l9_184=l9_182;
float l9_185=l9_183;
bool l9_186;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_186=ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y==3;
}
#else
{
l9_186=(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0);
}
#endif
float l9_187=l9_178;
float l9_188=l9_185;
sc_ClampUV(l9_187,detailNormalTexUvMinMax.y,detailNormalTexUvMinMax.w,l9_186,l9_188);
l9_180=l9_188;
l9_179=vec2(l9_184,l9_187);
}
#else
{
l9_180=1.0;
l9_179=vec2(l9_176,l9_178);
}
#endif
vec2 l9_189=sc_TransformUV(l9_179,(int(SC_USE_UV_TRANSFORM_detailNormalTex)!=0),detailNormalTexTransform);
float l9_190=l9_189.x;
float l9_191=l9_180;
sc_SoftwareWrapLate(l9_190,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x,(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_detailNormalTex)!=0)),l9_191);
float l9_192=l9_189.y;
float l9_193=l9_191;
sc_SoftwareWrapLate(l9_192,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y,(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_detailNormalTex)!=0)),l9_193);
float l9_194=l9_193;
vec3 l9_195=sc_SamplingCoordsViewToGlobal(vec2(l9_190,l9_192),detailNormalTexLayout,detailNormalTexGetStereoViewIndex());
vec4 l9_196=texture(detailNormalTexArrSC,l9_195,0.0);
vec4 l9_197;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_197=mix(detailNormalTexBorderColor,l9_196,vec4(l9_194));
}
#else
{
l9_197=l9_196;
}
#endif
l9_174=l9_197;
}
#else
{
float l9_198=l9_173.x;
sc_SoftwareWrapEarly(l9_198,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x);
float l9_199=l9_198;
float l9_200=l9_173.y;
sc_SoftwareWrapEarly(l9_200,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y);
float l9_201=l9_200;
vec2 l9_202;
float l9_203;
#if (SC_USE_UV_MIN_MAX_detailNormalTex)
{
bool l9_204;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_204=ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x==3;
}
#else
{
l9_204=(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0);
}
#endif
float l9_205=l9_199;
float l9_206=1.0;
sc_ClampUV(l9_205,detailNormalTexUvMinMax.x,detailNormalTexUvMinMax.z,l9_204,l9_206);
float l9_207=l9_205;
float l9_208=l9_206;
bool l9_209;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_209=ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y==3;
}
#else
{
l9_209=(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0);
}
#endif
float l9_210=l9_201;
float l9_211=l9_208;
sc_ClampUV(l9_210,detailNormalTexUvMinMax.y,detailNormalTexUvMinMax.w,l9_209,l9_211);
l9_203=l9_211;
l9_202=vec2(l9_207,l9_210);
}
#else
{
l9_203=1.0;
l9_202=vec2(l9_199,l9_201);
}
#endif
vec2 l9_212=sc_TransformUV(l9_202,(int(SC_USE_UV_TRANSFORM_detailNormalTex)!=0),detailNormalTexTransform);
float l9_213=l9_212.x;
float l9_214=l9_203;
sc_SoftwareWrapLate(l9_213,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).x,(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_detailNormalTex)!=0)),l9_214);
float l9_215=l9_212.y;
float l9_216=l9_214;
sc_SoftwareWrapLate(l9_215,ivec2(SC_SOFTWARE_WRAP_MODE_U_detailNormalTex,SC_SOFTWARE_WRAP_MODE_V_detailNormalTex).y,(int(SC_USE_CLAMP_TO_BORDER_detailNormalTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_detailNormalTex)!=0)),l9_216);
float l9_217=l9_216;
vec3 l9_218=sc_SamplingCoordsViewToGlobal(vec2(l9_213,l9_215),detailNormalTexLayout,detailNormalTexGetStereoViewIndex());
vec4 l9_219=texture(detailNormalTex,l9_218.xy,0.0);
vec4 l9_220;
#if (SC_USE_CLAMP_TO_BORDER_detailNormalTex)
{
l9_220=mix(detailNormalTexBorderColor,l9_219,vec4(l9_217));
}
#else
{
l9_220=l9_219;
}
#endif
l9_174=l9_220;
}
#endif
l9_172=(l9_174.xyz*1.9921875)-vec3(1.0);
}
#else
{
l9_172=vec3(0.0,0.0,1.0);
}
#endif
vec3 l9_221=((l9_125.xyz*1.9921875)-vec3(1.0))+vec3(0.0,0.0,1.0);
vec3 l9_222=l9_172*vec3(-1.0,-1.0,1.0);
l9_123=normalize(mat3(tempGlobals.VertexTangent_WorldSpace,tempGlobals.VertexBinormal_WorldSpace,tempGlobals.VertexNormal_WorldSpace)*normalize((l9_221*dot(l9_221,l9_222))-(l9_222*l9_221.z)));
}
#else
{
l9_123=normalize(tempGlobals.VertexNormal_WorldSpace);
}
#endif
vec3 l9_223;
#if (ENABLE_EMISSIVE)
{
vec2 l9_224=N7_getUV(NODE_76_DROPLIST_ITEM);
vec4 l9_225;
#if (emissiveTexLayout==2)
{
float l9_226=l9_224.x;
sc_SoftwareWrapEarly(l9_226,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x);
float l9_227=l9_226;
float l9_228=l9_224.y;
sc_SoftwareWrapEarly(l9_228,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y);
float l9_229=l9_228;
vec2 l9_230;
float l9_231;
#if (SC_USE_UV_MIN_MAX_emissiveTex)
{
bool l9_232;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_232=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x==3;
}
#else
{
l9_232=(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0);
}
#endif
float l9_233=l9_227;
float l9_234=1.0;
sc_ClampUV(l9_233,emissiveTexUvMinMax.x,emissiveTexUvMinMax.z,l9_232,l9_234);
float l9_235=l9_233;
float l9_236=l9_234;
bool l9_237;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_237=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y==3;
}
#else
{
l9_237=(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0);
}
#endif
float l9_238=l9_229;
float l9_239=l9_236;
sc_ClampUV(l9_238,emissiveTexUvMinMax.y,emissiveTexUvMinMax.w,l9_237,l9_239);
l9_231=l9_239;
l9_230=vec2(l9_235,l9_238);
}
#else
{
l9_231=1.0;
l9_230=vec2(l9_227,l9_229);
}
#endif
vec2 l9_240=sc_TransformUV(l9_230,(int(SC_USE_UV_TRANSFORM_emissiveTex)!=0),emissiveTexTransform);
float l9_241=l9_240.x;
float l9_242=l9_231;
sc_SoftwareWrapLate(l9_241,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x,(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTex)!=0)),l9_242);
float l9_243=l9_240.y;
float l9_244=l9_242;
sc_SoftwareWrapLate(l9_243,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y,(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTex)!=0)),l9_244);
float l9_245=l9_244;
vec3 l9_246=sc_SamplingCoordsViewToGlobal(vec2(l9_241,l9_243),emissiveTexLayout,emissiveTexGetStereoViewIndex());
vec4 l9_247=texture(emissiveTexArrSC,l9_246,0.0);
vec4 l9_248;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_248=mix(emissiveTexBorderColor,l9_247,vec4(l9_245));
}
#else
{
l9_248=l9_247;
}
#endif
l9_225=l9_248;
}
#else
{
float l9_249=l9_224.x;
sc_SoftwareWrapEarly(l9_249,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x);
float l9_250=l9_249;
float l9_251=l9_224.y;
sc_SoftwareWrapEarly(l9_251,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y);
float l9_252=l9_251;
vec2 l9_253;
float l9_254;
#if (SC_USE_UV_MIN_MAX_emissiveTex)
{
bool l9_255;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_255=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x==3;
}
#else
{
l9_255=(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0);
}
#endif
float l9_256=l9_250;
float l9_257=1.0;
sc_ClampUV(l9_256,emissiveTexUvMinMax.x,emissiveTexUvMinMax.z,l9_255,l9_257);
float l9_258=l9_256;
float l9_259=l9_257;
bool l9_260;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_260=ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y==3;
}
#else
{
l9_260=(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0);
}
#endif
float l9_261=l9_252;
float l9_262=l9_259;
sc_ClampUV(l9_261,emissiveTexUvMinMax.y,emissiveTexUvMinMax.w,l9_260,l9_262);
l9_254=l9_262;
l9_253=vec2(l9_258,l9_261);
}
#else
{
l9_254=1.0;
l9_253=vec2(l9_250,l9_252);
}
#endif
vec2 l9_263=sc_TransformUV(l9_253,(int(SC_USE_UV_TRANSFORM_emissiveTex)!=0),emissiveTexTransform);
float l9_264=l9_263.x;
float l9_265=l9_254;
sc_SoftwareWrapLate(l9_264,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).x,(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTex)!=0)),l9_265);
float l9_266=l9_263.y;
float l9_267=l9_265;
sc_SoftwareWrapLate(l9_266,ivec2(SC_SOFTWARE_WRAP_MODE_U_emissiveTex,SC_SOFTWARE_WRAP_MODE_V_emissiveTex).y,(int(SC_USE_CLAMP_TO_BORDER_emissiveTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_emissiveTex)!=0)),l9_267);
float l9_268=l9_267;
vec3 l9_269=sc_SamplingCoordsViewToGlobal(vec2(l9_264,l9_266),emissiveTexLayout,emissiveTexGetStereoViewIndex());
vec4 l9_270=texture(emissiveTex,l9_269.xy,0.0);
vec4 l9_271;
#if (SC_USE_CLAMP_TO_BORDER_emissiveTex)
{
l9_271=mix(emissiveTexBorderColor,l9_270,vec4(l9_268));
}
#else
{
l9_271=l9_270;
}
#endif
l9_225=l9_271;
}
#endif
l9_223=l9_225.xyz;
}
#else
{
l9_223=vec3(0.0);
}
#endif
vec3 l9_272;
#if (NODE_38_DROPLIST_ITEM==2)
{
l9_272=l9_223+tempGlobals.VertexColor.xyz;
}
#else
{
l9_272=l9_223;
}
#endif
vec3 l9_273;
#if ((NODE_38_DROPLIST_ITEM==2)||ENABLE_EMISSIVE)
{
l9_273=ssPow((l9_272*emissiveColor)*vec3(emissiveIntensity),vec3(2.2));
}
#else
{
l9_273=l9_272;
}
#endif
vec3 l9_274;
#if (ENABLE_SIMPLE_REFLECTION)
{
vec3 l9_275=tempGlobals.ViewDirWS;
vec3 l9_276=reflect(l9_275,l9_123);
float l9_277=l9_276.x;
float l9_278=l9_276.y;
float l9_279=(-l9_276.z)+1.0;
float l9_280=((l9_277*l9_277)+(l9_278*l9_278))+(l9_279*l9_279);
float l9_281;
if (l9_280<=0.0)
{
l9_281=0.0;
}
else
{
l9_281=sqrt(l9_280);
}
float l9_282=2.0*l9_281;
vec2 l9_283=vec2(1.0)-((l9_276.xy/vec2(l9_282))+vec2(0.5));
vec4 l9_284;
#if (reflectionTexLayout==2)
{
float l9_285=l9_283.x;
sc_SoftwareWrapEarly(l9_285,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x);
float l9_286=l9_285;
float l9_287=l9_283.y;
sc_SoftwareWrapEarly(l9_287,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y);
float l9_288=l9_287;
vec2 l9_289;
float l9_290;
#if (SC_USE_UV_MIN_MAX_reflectionTex)
{
bool l9_291;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_291=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x==3;
}
#else
{
l9_291=(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0);
}
#endif
float l9_292=l9_286;
float l9_293=1.0;
sc_ClampUV(l9_292,reflectionTexUvMinMax.x,reflectionTexUvMinMax.z,l9_291,l9_293);
float l9_294=l9_292;
float l9_295=l9_293;
bool l9_296;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_296=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y==3;
}
#else
{
l9_296=(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0);
}
#endif
float l9_297=l9_288;
float l9_298=l9_295;
sc_ClampUV(l9_297,reflectionTexUvMinMax.y,reflectionTexUvMinMax.w,l9_296,l9_298);
l9_290=l9_298;
l9_289=vec2(l9_294,l9_297);
}
#else
{
l9_290=1.0;
l9_289=vec2(l9_286,l9_288);
}
#endif
vec2 l9_299=sc_TransformUV(l9_289,(int(SC_USE_UV_TRANSFORM_reflectionTex)!=0),reflectionTexTransform);
float l9_300=l9_299.x;
float l9_301=l9_290;
sc_SoftwareWrapLate(l9_300,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x,(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionTex)!=0)),l9_301);
float l9_302=l9_299.y;
float l9_303=l9_301;
sc_SoftwareWrapLate(l9_302,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y,(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionTex)!=0)),l9_303);
float l9_304=l9_303;
vec3 l9_305=sc_SamplingCoordsViewToGlobal(vec2(l9_300,l9_302),reflectionTexLayout,reflectionTexGetStereoViewIndex());
vec4 l9_306=texture(reflectionTexArrSC,l9_305,0.0);
vec4 l9_307;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_307=mix(reflectionTexBorderColor,l9_306,vec4(l9_304));
}
#else
{
l9_307=l9_306;
}
#endif
l9_284=l9_307;
}
#else
{
float l9_308=l9_283.x;
sc_SoftwareWrapEarly(l9_308,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x);
float l9_309=l9_308;
float l9_310=l9_283.y;
sc_SoftwareWrapEarly(l9_310,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y);
float l9_311=l9_310;
vec2 l9_312;
float l9_313;
#if (SC_USE_UV_MIN_MAX_reflectionTex)
{
bool l9_314;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_314=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x==3;
}
#else
{
l9_314=(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0);
}
#endif
float l9_315=l9_309;
float l9_316=1.0;
sc_ClampUV(l9_315,reflectionTexUvMinMax.x,reflectionTexUvMinMax.z,l9_314,l9_316);
float l9_317=l9_315;
float l9_318=l9_316;
bool l9_319;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_319=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y==3;
}
#else
{
l9_319=(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0);
}
#endif
float l9_320=l9_311;
float l9_321=l9_318;
sc_ClampUV(l9_320,reflectionTexUvMinMax.y,reflectionTexUvMinMax.w,l9_319,l9_321);
l9_313=l9_321;
l9_312=vec2(l9_317,l9_320);
}
#else
{
l9_313=1.0;
l9_312=vec2(l9_309,l9_311);
}
#endif
vec2 l9_322=sc_TransformUV(l9_312,(int(SC_USE_UV_TRANSFORM_reflectionTex)!=0),reflectionTexTransform);
float l9_323=l9_322.x;
float l9_324=l9_313;
sc_SoftwareWrapLate(l9_323,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).x,(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionTex)!=0)),l9_324);
float l9_325=l9_322.y;
float l9_326=l9_324;
sc_SoftwareWrapLate(l9_325,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionTex,SC_SOFTWARE_WRAP_MODE_V_reflectionTex).y,(int(SC_USE_CLAMP_TO_BORDER_reflectionTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionTex)!=0)),l9_326);
float l9_327=l9_326;
vec3 l9_328=sc_SamplingCoordsViewToGlobal(vec2(l9_323,l9_325),reflectionTexLayout,reflectionTexGetStereoViewIndex());
vec4 l9_329=texture(reflectionTex,l9_328.xy,0.0);
vec4 l9_330;
#if (SC_USE_CLAMP_TO_BORDER_reflectionTex)
{
l9_330=mix(reflectionTexBorderColor,l9_329,vec4(l9_327));
}
#else
{
l9_330=l9_329;
}
#endif
l9_284=l9_330;
}
#endif
vec3 l9_331;
#if (Tweak_N177)
{
vec2 l9_332=N7_getUV(NODE_228_DROPLIST_ITEM);
vec4 l9_333;
#if (reflectionModulationTexLayout==2)
{
float l9_334=l9_332.x;
sc_SoftwareWrapEarly(l9_334,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x);
float l9_335=l9_334;
float l9_336=l9_332.y;
sc_SoftwareWrapEarly(l9_336,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y);
float l9_337=l9_336;
vec2 l9_338;
float l9_339;
#if (SC_USE_UV_MIN_MAX_reflectionModulationTex)
{
bool l9_340;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_340=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x==3;
}
#else
{
l9_340=(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0);
}
#endif
float l9_341=l9_335;
float l9_342=1.0;
sc_ClampUV(l9_341,reflectionModulationTexUvMinMax.x,reflectionModulationTexUvMinMax.z,l9_340,l9_342);
float l9_343=l9_341;
float l9_344=l9_342;
bool l9_345;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_345=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y==3;
}
#else
{
l9_345=(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0);
}
#endif
float l9_346=l9_337;
float l9_347=l9_344;
sc_ClampUV(l9_346,reflectionModulationTexUvMinMax.y,reflectionModulationTexUvMinMax.w,l9_345,l9_347);
l9_339=l9_347;
l9_338=vec2(l9_343,l9_346);
}
#else
{
l9_339=1.0;
l9_338=vec2(l9_335,l9_337);
}
#endif
vec2 l9_348=sc_TransformUV(l9_338,(int(SC_USE_UV_TRANSFORM_reflectionModulationTex)!=0),reflectionModulationTexTransform);
float l9_349=l9_348.x;
float l9_350=l9_339;
sc_SoftwareWrapLate(l9_349,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x,(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionModulationTex)!=0)),l9_350);
float l9_351=l9_348.y;
float l9_352=l9_350;
sc_SoftwareWrapLate(l9_351,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y,(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionModulationTex)!=0)),l9_352);
float l9_353=l9_352;
vec3 l9_354=sc_SamplingCoordsViewToGlobal(vec2(l9_349,l9_351),reflectionModulationTexLayout,reflectionModulationTexGetStereoViewIndex());
vec4 l9_355=texture(reflectionModulationTexArrSC,l9_354,0.0);
vec4 l9_356;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_356=mix(reflectionModulationTexBorderColor,l9_355,vec4(l9_353));
}
#else
{
l9_356=l9_355;
}
#endif
l9_333=l9_356;
}
#else
{
float l9_357=l9_332.x;
sc_SoftwareWrapEarly(l9_357,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x);
float l9_358=l9_357;
float l9_359=l9_332.y;
sc_SoftwareWrapEarly(l9_359,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y);
float l9_360=l9_359;
vec2 l9_361;
float l9_362;
#if (SC_USE_UV_MIN_MAX_reflectionModulationTex)
{
bool l9_363;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_363=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x==3;
}
#else
{
l9_363=(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0);
}
#endif
float l9_364=l9_358;
float l9_365=1.0;
sc_ClampUV(l9_364,reflectionModulationTexUvMinMax.x,reflectionModulationTexUvMinMax.z,l9_363,l9_365);
float l9_366=l9_364;
float l9_367=l9_365;
bool l9_368;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_368=ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y==3;
}
#else
{
l9_368=(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0);
}
#endif
float l9_369=l9_360;
float l9_370=l9_367;
sc_ClampUV(l9_369,reflectionModulationTexUvMinMax.y,reflectionModulationTexUvMinMax.w,l9_368,l9_370);
l9_362=l9_370;
l9_361=vec2(l9_366,l9_369);
}
#else
{
l9_362=1.0;
l9_361=vec2(l9_358,l9_360);
}
#endif
vec2 l9_371=sc_TransformUV(l9_361,(int(SC_USE_UV_TRANSFORM_reflectionModulationTex)!=0),reflectionModulationTexTransform);
float l9_372=l9_371.x;
float l9_373=l9_362;
sc_SoftwareWrapLate(l9_372,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).x,(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionModulationTex)!=0)),l9_373);
float l9_374=l9_371.y;
float l9_375=l9_373;
sc_SoftwareWrapLate(l9_374,ivec2(SC_SOFTWARE_WRAP_MODE_U_reflectionModulationTex,SC_SOFTWARE_WRAP_MODE_V_reflectionModulationTex).y,(int(SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_reflectionModulationTex)!=0)),l9_375);
float l9_376=l9_375;
vec3 l9_377=sc_SamplingCoordsViewToGlobal(vec2(l9_372,l9_374),reflectionModulationTexLayout,reflectionModulationTexGetStereoViewIndex());
vec4 l9_378=texture(reflectionModulationTex,l9_377.xy,0.0);
vec4 l9_379;
#if (SC_USE_CLAMP_TO_BORDER_reflectionModulationTex)
{
l9_379=mix(reflectionModulationTexBorderColor,l9_378,vec4(l9_376));
}
#else
{
l9_379=l9_378;
}
#endif
l9_333=l9_379;
}
#endif
l9_331=l9_284.xyz*l9_333.xyz;
}
#else
{
l9_331=l9_284.xyz;
}
#endif
l9_274=N7_vec3srgbToLinear(l9_331)*reflectionIntensity;
}
#else
{
l9_274=vec3(0.0);
}
#endif
vec3 l9_380;
#if (ENABLE_RIM_HIGHLIGHT)
{
vec3 l9_381=rimColor*rimIntensity;
vec3 l9_382;
#if (Tweak_N216)
{
vec2 l9_383=N7_getUV(NODE_315_DROPLIST_ITEM);
vec4 l9_384;
#if (rimColorTexLayout==2)
{
float l9_385=l9_383.x;
sc_SoftwareWrapEarly(l9_385,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x);
float l9_386=l9_385;
float l9_387=l9_383.y;
sc_SoftwareWrapEarly(l9_387,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y);
float l9_388=l9_387;
vec2 l9_389;
float l9_390;
#if (SC_USE_UV_MIN_MAX_rimColorTex)
{
bool l9_391;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_391=ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x==3;
}
#else
{
l9_391=(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0);
}
#endif
float l9_392=l9_386;
float l9_393=1.0;
sc_ClampUV(l9_392,rimColorTexUvMinMax.x,rimColorTexUvMinMax.z,l9_391,l9_393);
float l9_394=l9_392;
float l9_395=l9_393;
bool l9_396;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_396=ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y==3;
}
#else
{
l9_396=(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0);
}
#endif
float l9_397=l9_388;
float l9_398=l9_395;
sc_ClampUV(l9_397,rimColorTexUvMinMax.y,rimColorTexUvMinMax.w,l9_396,l9_398);
l9_390=l9_398;
l9_389=vec2(l9_394,l9_397);
}
#else
{
l9_390=1.0;
l9_389=vec2(l9_386,l9_388);
}
#endif
vec2 l9_399=sc_TransformUV(l9_389,(int(SC_USE_UV_TRANSFORM_rimColorTex)!=0),rimColorTexTransform);
float l9_400=l9_399.x;
float l9_401=l9_390;
sc_SoftwareWrapLate(l9_400,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x,(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_rimColorTex)!=0)),l9_401);
float l9_402=l9_399.y;
float l9_403=l9_401;
sc_SoftwareWrapLate(l9_402,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y,(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_rimColorTex)!=0)),l9_403);
float l9_404=l9_403;
vec3 l9_405=sc_SamplingCoordsViewToGlobal(vec2(l9_400,l9_402),rimColorTexLayout,rimColorTexGetStereoViewIndex());
vec4 l9_406=texture(rimColorTexArrSC,l9_405,0.0);
vec4 l9_407;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_407=mix(rimColorTexBorderColor,l9_406,vec4(l9_404));
}
#else
{
l9_407=l9_406;
}
#endif
l9_384=l9_407;
}
#else
{
float l9_408=l9_383.x;
sc_SoftwareWrapEarly(l9_408,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x);
float l9_409=l9_408;
float l9_410=l9_383.y;
sc_SoftwareWrapEarly(l9_410,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y);
float l9_411=l9_410;
vec2 l9_412;
float l9_413;
#if (SC_USE_UV_MIN_MAX_rimColorTex)
{
bool l9_414;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_414=ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x==3;
}
#else
{
l9_414=(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0);
}
#endif
float l9_415=l9_409;
float l9_416=1.0;
sc_ClampUV(l9_415,rimColorTexUvMinMax.x,rimColorTexUvMinMax.z,l9_414,l9_416);
float l9_417=l9_415;
float l9_418=l9_416;
bool l9_419;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_419=ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y==3;
}
#else
{
l9_419=(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0);
}
#endif
float l9_420=l9_411;
float l9_421=l9_418;
sc_ClampUV(l9_420,rimColorTexUvMinMax.y,rimColorTexUvMinMax.w,l9_419,l9_421);
l9_413=l9_421;
l9_412=vec2(l9_417,l9_420);
}
#else
{
l9_413=1.0;
l9_412=vec2(l9_409,l9_411);
}
#endif
vec2 l9_422=sc_TransformUV(l9_412,(int(SC_USE_UV_TRANSFORM_rimColorTex)!=0),rimColorTexTransform);
float l9_423=l9_422.x;
float l9_424=l9_413;
sc_SoftwareWrapLate(l9_423,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).x,(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_rimColorTex)!=0)),l9_424);
float l9_425=l9_422.y;
float l9_426=l9_424;
sc_SoftwareWrapLate(l9_425,ivec2(SC_SOFTWARE_WRAP_MODE_U_rimColorTex,SC_SOFTWARE_WRAP_MODE_V_rimColorTex).y,(int(SC_USE_CLAMP_TO_BORDER_rimColorTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_rimColorTex)!=0)),l9_426);
float l9_427=l9_426;
vec3 l9_428=sc_SamplingCoordsViewToGlobal(vec2(l9_423,l9_425),rimColorTexLayout,rimColorTexGetStereoViewIndex());
vec4 l9_429=texture(rimColorTex,l9_428.xy,0.0);
vec4 l9_430;
#if (SC_USE_CLAMP_TO_BORDER_rimColorTex)
{
l9_430=mix(rimColorTexBorderColor,l9_429,vec4(l9_427));
}
#else
{
l9_430=l9_429;
}
#endif
l9_384=l9_430;
}
#endif
l9_382=l9_381*l9_384.xyz;
}
#else
{
l9_382=l9_381;
}
#endif
vec3 l9_431=tempGlobals.ViewDirWS;
float l9_432=dot(l9_123,l9_431);
float l9_433=abs(l9_432);
float l9_434;
#if (!ENABLE_RIM_INVERT)
{
l9_434=1.0-l9_433;
}
#else
{
l9_434=l9_433;
}
#endif
l9_380=vec3(0.0)+(N7_vec3srgbToLinear(l9_382)*ssPow(l9_434,rimExponent));
}
#else
{
l9_380=vec3(0.0);
}
#endif
vec3 l9_435=ssPow((l9_273+l9_274)+l9_380,vec3(0.45454547));
vec2 l9_436=N7_getUV(NODE_221_DROPLIST_ITEM);
vec4 l9_437;
#if (materialParamsTexLayout==2)
{
float l9_438=l9_436.x;
sc_SoftwareWrapEarly(l9_438,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x);
float l9_439=l9_438;
float l9_440=l9_436.y;
sc_SoftwareWrapEarly(l9_440,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y);
float l9_441=l9_440;
vec2 l9_442;
float l9_443;
#if (SC_USE_UV_MIN_MAX_materialParamsTex)
{
bool l9_444;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_444=ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x==3;
}
#else
{
l9_444=(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0);
}
#endif
float l9_445=l9_439;
float l9_446=1.0;
sc_ClampUV(l9_445,materialParamsTexUvMinMax.x,materialParamsTexUvMinMax.z,l9_444,l9_446);
float l9_447=l9_445;
float l9_448=l9_446;
bool l9_449;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_449=ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y==3;
}
#else
{
l9_449=(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0);
}
#endif
float l9_450=l9_441;
float l9_451=l9_448;
sc_ClampUV(l9_450,materialParamsTexUvMinMax.y,materialParamsTexUvMinMax.w,l9_449,l9_451);
l9_443=l9_451;
l9_442=vec2(l9_447,l9_450);
}
#else
{
l9_443=1.0;
l9_442=vec2(l9_439,l9_441);
}
#endif
vec2 l9_452=sc_TransformUV(l9_442,(int(SC_USE_UV_TRANSFORM_materialParamsTex)!=0),materialParamsTexTransform);
float l9_453=l9_452.x;
float l9_454=l9_443;
sc_SoftwareWrapLate(l9_453,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x,(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_materialParamsTex)!=0)),l9_454);
float l9_455=l9_452.y;
float l9_456=l9_454;
sc_SoftwareWrapLate(l9_455,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y,(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_materialParamsTex)!=0)),l9_456);
float l9_457=l9_456;
vec3 l9_458=sc_SamplingCoordsViewToGlobal(vec2(l9_453,l9_455),materialParamsTexLayout,materialParamsTexGetStereoViewIndex());
vec4 l9_459=texture(materialParamsTexArrSC,l9_458,0.0);
vec4 l9_460;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_460=mix(materialParamsTexBorderColor,l9_459,vec4(l9_457));
}
#else
{
l9_460=l9_459;
}
#endif
l9_437=l9_460;
}
#else
{
float l9_461=l9_436.x;
sc_SoftwareWrapEarly(l9_461,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x);
float l9_462=l9_461;
float l9_463=l9_436.y;
sc_SoftwareWrapEarly(l9_463,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y);
float l9_464=l9_463;
vec2 l9_465;
float l9_466;
#if (SC_USE_UV_MIN_MAX_materialParamsTex)
{
bool l9_467;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_467=ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x==3;
}
#else
{
l9_467=(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0);
}
#endif
float l9_468=l9_462;
float l9_469=1.0;
sc_ClampUV(l9_468,materialParamsTexUvMinMax.x,materialParamsTexUvMinMax.z,l9_467,l9_469);
float l9_470=l9_468;
float l9_471=l9_469;
bool l9_472;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_472=ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y==3;
}
#else
{
l9_472=(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0);
}
#endif
float l9_473=l9_464;
float l9_474=l9_471;
sc_ClampUV(l9_473,materialParamsTexUvMinMax.y,materialParamsTexUvMinMax.w,l9_472,l9_474);
l9_466=l9_474;
l9_465=vec2(l9_470,l9_473);
}
#else
{
l9_466=1.0;
l9_465=vec2(l9_462,l9_464);
}
#endif
vec2 l9_475=sc_TransformUV(l9_465,(int(SC_USE_UV_TRANSFORM_materialParamsTex)!=0),materialParamsTexTransform);
float l9_476=l9_475.x;
float l9_477=l9_466;
sc_SoftwareWrapLate(l9_476,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).x,(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_materialParamsTex)!=0)),l9_477);
float l9_478=l9_475.y;
float l9_479=l9_477;
sc_SoftwareWrapLate(l9_478,ivec2(SC_SOFTWARE_WRAP_MODE_U_materialParamsTex,SC_SOFTWARE_WRAP_MODE_V_materialParamsTex).y,(int(SC_USE_CLAMP_TO_BORDER_materialParamsTex)!=0)&&(!(int(SC_USE_UV_MIN_MAX_materialParamsTex)!=0)),l9_479);
float l9_480=l9_479;
vec3 l9_481=sc_SamplingCoordsViewToGlobal(vec2(l9_476,l9_478),materialParamsTexLayout,materialParamsTexGetStereoViewIndex());
vec4 l9_482=texture(materialParamsTex,l9_481.xy,0.0);
vec4 l9_483;
#if (SC_USE_CLAMP_TO_BORDER_materialParamsTex)
{
l9_483=mix(materialParamsTexBorderColor,l9_482,vec4(l9_480));
}
#else
{
l9_483=l9_482;
}
#endif
l9_437=l9_483;
}
#endif
float l9_484=l9_437.x*metallic;
vec3 l9_485;
#if (NODE_38_DROPLIST_ITEM==3)
{
l9_485=vec3(l9_437.z)*tempGlobals.VertexColor.xyz;
}
#else
{
l9_485=vec3(l9_437.z);
}
#endif
vec3 l9_486;
#if (ENABLE_SPECULAR_AO)
{
vec3 l9_487=mix(vec3(0.039999999),l9_121.xyz*l9_484,vec3(l9_484));
l9_486=mix(vec3(1.0),mix((l9_487*(1.0-specularAoDarkening))*l9_487,vec3(1.0),vec3(l9_485.x)),vec3(specularAoIntensity));
}
#else
{
l9_486=vec3(1.0);
}
#endif
vec3 l9_488;
#if (ENABLE_SIMPLE_REFLECTION)
{
l9_488=vec3(0.0);
}
#else
{
l9_488=l9_486;
}
#endif
vec3 l9_489;
#if (!sc_ProjectiveShadowsCaster)
{
l9_489=l9_123;
}
#else
{
l9_489=vec3(0.0);
}
#endif
float l9_490=clamp(l9_122,0.0,1.0);
#if (sc_BlendMode_AlphaTest)
{
if (l9_490<alphaTestThreshold)
{
discard;
}
}
#endif
#if (ENABLE_STIPPLE_PATTERN_TEST)
{
if (l9_490<((mod(dot(floor(mod(gl_FragCoord.xy,vec2(4.0))),vec2(4.0,1.0))*9.0,16.0)+1.0)/17.0))
{
discard;
}
}
#endif
vec3 l9_491=max(l9_121.xyz,vec3(0.0));
vec4 l9_492;
#if (sc_ProjectiveShadowsCaster)
{
l9_492=vec4(l9_491,l9_490);
}
#else
{
l9_492=ngsCalculateLighting(l9_491,l9_490,l9_489,l9_10,l9_11,max(l9_435,vec3(0.0)),clamp(l9_484,0.0,1.0),clamp(l9_437.y*roughness,0.0,1.0),clamp(l9_485,vec3(0.0),vec3(1.0)),clamp(l9_488,vec3(0.0),vec3(1.0)));
}
#endif
vec4 l9_493=max(l9_492,vec4(0.0));
if (isProxyMode)
{
vec4 l9_494;
#if (sc_ProxyAlphaOne)
{
vec4 l9_495=l9_493;
l9_495.w=1.0;
l9_494=l9_495;
}
#else
{
l9_494=l9_493;
}
#endif
sc_writeFragData0(max(l9_494,vec4(0.0)));
return;
}
vec4 l9_496;
#if (sc_ProjectiveShadowsCaster)
{
float l9_497;
#if (((sc_BlendMode_Normal||sc_BlendMode_AlphaToCoverage)||sc_BlendMode_PremultipliedAlphaHardware)||sc_BlendMode_PremultipliedAlphaAuto)
{
l9_497=l9_493.w;
}
#else
{
float l9_498;
#if (sc_BlendMode_PremultipliedAlpha)
{
l9_498=clamp(l9_493.w*2.0,0.0,1.0);
}
#else
{
float l9_499;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_499=clamp(dot(l9_493.xyz,vec3(l9_493.w)),0.0,1.0);
}
#else
{
float l9_500;
#if (sc_BlendMode_AlphaTest)
{
l9_500=1.0;
}
#else
{
float l9_501;
#if (sc_BlendMode_Multiply)
{
l9_501=(1.0-dot(l9_493.xyz,vec3(0.33333001)))*l9_493.w;
}
#else
{
float l9_502;
#if (sc_BlendMode_MultiplyOriginal)
{
l9_502=(1.0-clamp(dot(l9_493.xyz,vec3(1.0)),0.0,1.0))*l9_493.w;
}
#else
{
float l9_503;
#if (sc_BlendMode_ColoredGlass)
{
l9_503=clamp(dot(l9_493.xyz,vec3(1.0)),0.0,1.0)*l9_493.w;
}
#else
{
float l9_504;
#if (sc_BlendMode_Add)
{
l9_504=clamp(dot(l9_493.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_505;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_505=clamp(dot(l9_493.xyz,vec3(1.0)),0.0,1.0)*l9_493.w;
}
#else
{
float l9_506;
#if (sc_BlendMode_Screen)
{
l9_506=dot(l9_493.xyz,vec3(0.33333001))*l9_493.w;
}
#else
{
float l9_507;
#if (sc_BlendMode_Min)
{
l9_507=1.0-clamp(dot(l9_493.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_508;
#if (sc_BlendMode_Max)
{
l9_508=clamp(dot(l9_493.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
l9_508=1.0;
}
#endif
l9_507=l9_508;
}
#endif
l9_506=l9_507;
}
#endif
l9_505=l9_506;
}
#endif
l9_504=l9_505;
}
#endif
l9_503=l9_504;
}
#endif
l9_502=l9_503;
}
#endif
l9_501=l9_502;
}
#endif
l9_500=l9_501;
}
#endif
l9_499=l9_500;
}
#endif
l9_498=l9_499;
}
#endif
l9_497=l9_498;
}
#endif
l9_496=vec4(mix(sc_ShadowColor.xyz,sc_ShadowColor.xyz*l9_493.xyz,vec3(sc_ShadowColor.w)),sc_ShadowDensity*l9_497);
}
#else
{
vec4 l9_509;
#if (sc_RenderAlphaToColor)
{
l9_509=vec4(l9_493.w);
}
#else
{
vec4 l9_510;
#if (sc_BlendMode_Custom)
{
vec3 l9_511=sc_GetFramebufferColor().xyz;
vec3 l9_512=mix(l9_511,definedBlend(l9_511,l9_493.xyz).xyz,vec3(l9_493.w));
vec4 l9_513=vec4(l9_512.x,l9_512.y,l9_512.z,vec4(0.0).w);
l9_513.w=1.0;
l9_510=l9_513;
}
#else
{
vec4 l9_514;
#if (sc_BlendMode_MultiplyOriginal)
{
float l9_515=l9_493.w;
l9_514=vec4(mix(vec3(1.0),l9_493.xyz,vec3(l9_515)),l9_515);
}
#else
{
vec4 l9_516;
#if (sc_BlendMode_Screen||sc_BlendMode_PremultipliedAlphaAuto)
{
float l9_517=l9_493.w;
float l9_518;
#if (sc_BlendMode_PremultipliedAlphaAuto)
{
l9_518=clamp(l9_517,0.0,1.0);
}
#else
{
l9_518=l9_517;
}
#endif
l9_516=vec4(l9_493.xyz*l9_518,l9_518);
}
#else
{
l9_516=l9_493;
}
#endif
l9_514=l9_516;
}
#endif
l9_510=l9_514;
}
#endif
l9_509=l9_510;
}
#endif
l9_496=l9_509;
}
#endif
vec4 l9_519;
if (PreviewEnabled==1)
{
vec4 l9_520;
if (((PreviewVertexSaved*1.0)!=0.0) ? true : false)
{
l9_520=PreviewVertexColor;
}
else
{
l9_520=vec4(0.0);
}
l9_519=l9_520;
}
else
{
l9_519=l9_496;
}
vec4 l9_521;
#if (sc_ShaderComplexityAnalyzer)
{
l9_521=vec4(shaderComplexityValue/255.0,0.0,0.0,1.0);
}
#else
{
l9_521=vec4(0.0);
}
#endif
vec4 l9_522;
if (l9_521.w>0.0)
{
l9_522=l9_521;
}
else
{
l9_522=l9_519;
}
vec4 l9_523=outputMotionVectorsIfNeeded(varPos,max(l9_522,vec4(0.0)));
vec4 l9_524=clamp(l9_523,vec4(0.0),vec4(1.0));
#if (sc_OITDepthBoundsPass)
{
#if (sc_OITDepthBoundsPass)
{
float l9_525=clamp(viewSpaceDepth()/1000.0,0.0,1.0);
sc_writeFragData0(vec4(max(0.0,1.0-(l9_525-0.0039215689)),min(1.0,l9_525+0.0039215689),0.0,0.0));
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
vec2 l9_526=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture(sc_OITFrontDepthTexture,l9_526).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_527=encodeDepth(viewSpaceDepth(),texture(sc_OITFilteredDepthBoundsTexture,l9_526).xy);
float l9_528=packValue(l9_527);
int l9_535=int(l9_524.w*255.0);
float l9_536=packValue(l9_535);
sc_writeFragData0(vec4(packValue(l9_527),packValue(l9_527),packValue(l9_527),packValue(l9_527)));
sc_writeFragData1(vec4(l9_528,packValue(l9_527),packValue(l9_527),packValue(l9_527)));
sc_writeFragData2(vec4(l9_536,packValue(l9_535),packValue(l9_535),packValue(l9_535)));
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
vec2 l9_539=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture(sc_OITFrontDepthTexture,l9_539).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_540[8];
int l9_541[8];
int l9_542=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_542<8)
{
l9_540[l9_542]=0;
l9_541[l9_542]=0;
l9_542++;
continue;
}
else
{
break;
}
}
int l9_543;
#if (sc_OITMaxLayers8)
{
l9_543=2;
}
#else
{
l9_543=1;
}
#endif
int l9_544=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_544<l9_543)
{
vec4 l9_545;
vec4 l9_546;
vec4 l9_547;
if (l9_544==0)
{
l9_547=texture(sc_OITAlpha0,l9_539);
l9_546=texture(sc_OITDepthLow0,l9_539);
l9_545=texture(sc_OITDepthHigh0,l9_539);
}
else
{
l9_547=vec4(0.0);
l9_546=vec4(0.0);
l9_545=vec4(0.0);
}
vec4 l9_548;
vec4 l9_549;
vec4 l9_550;
if (l9_544==1)
{
l9_550=texture(sc_OITAlpha1,l9_539);
l9_549=texture(sc_OITDepthLow1,l9_539);
l9_548=texture(sc_OITDepthHigh1,l9_539);
}
else
{
l9_550=l9_547;
l9_549=l9_546;
l9_548=l9_545;
}
if (any(notEqual(l9_548,vec4(0.0)))||any(notEqual(l9_549,vec4(0.0))))
{
int l9_551[8]=l9_540;
unpackValues(l9_548.w,l9_544,l9_551);
unpackValues(l9_548.z,l9_544,l9_551);
unpackValues(l9_548.y,l9_544,l9_551);
unpackValues(l9_548.x,l9_544,l9_551);
unpackValues(l9_549.w,l9_544,l9_551);
unpackValues(l9_549.z,l9_544,l9_551);
unpackValues(l9_549.y,l9_544,l9_551);
unpackValues(l9_549.x,l9_544,l9_551);
int l9_560[8]=l9_541;
unpackValues(l9_550.w,l9_544,l9_560);
unpackValues(l9_550.z,l9_544,l9_560);
unpackValues(l9_550.y,l9_544,l9_560);
unpackValues(l9_550.x,l9_544,l9_560);
}
l9_544++;
continue;
}
else
{
break;
}
}
vec4 l9_565=texture(sc_OITFilteredDepthBoundsTexture,l9_539);
vec2 l9_566=l9_565.xy;
int l9_567;
#if (sc_SkinBonesCount>0)
{
l9_567=encodeDepth(((1.0-l9_565.x)*1000.0)+getDepthOrderingEpsilon(),l9_566);
}
#else
{
l9_567=0;
}
#endif
int l9_568=encodeDepth(viewSpaceDepth(),l9_566);
vec4 l9_569;
l9_569=l9_524*l9_524.w;
vec4 l9_570;
int l9_571=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_571<8)
{
int l9_572=l9_540[l9_571];
int l9_573=l9_568-l9_567;
bool l9_574=l9_572<l9_573;
bool l9_575;
if (l9_574)
{
l9_575=l9_540[l9_571]>0;
}
else
{
l9_575=l9_574;
}
if (l9_575)
{
vec3 l9_576=l9_569.xyz*(1.0-(float(l9_541[l9_571])/255.0));
l9_570=vec4(l9_576.x,l9_576.y,l9_576.z,l9_569.w);
}
else
{
l9_570=l9_569;
}
l9_569=l9_570;
l9_571++;
continue;
}
else
{
break;
}
}
sc_writeFragData0(l9_569);
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
if (abs(gl_FragCoord.z-texture(sc_OITFrontDepthTexture,sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw)).x)>getFrontLayerZTestEpsilon())
{
discard;
}
sc_writeFragData0(l9_524);
}
#endif
}
#else
{
sc_writeFragData0(l9_523);
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
#endif // #if SC_RT_RECEIVER_MODE
#endif // #elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
