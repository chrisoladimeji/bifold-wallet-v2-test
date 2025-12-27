export const RTCView = jest.fn(() => null)
export const RTCPeerConnection = jest.fn()
export const RTCIceCandidate = jest.fn()
export const RTCSessionDescription = jest.fn()
export const MediaStream = jest.fn()
export const MediaStreamTrack = jest.fn()
export const mediaDevices = {
  getUserMedia: jest.fn(),
  enumerateDevices: jest.fn(),
}

export default {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
}
