import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as Network from 'expo-network';

const UUID_KEY = 'deviceUUID';

/**
 * Retrieves the stored UUID from SecureStore on native or localStorage on web
 * If it doesn't exist, generates a new one, stores it, and returns it.
 * @returns {Promise<string>} The device's unique UUID.
 */
export const getDeviceUUID = async (): Promise<string> => {
  if (Platform.OS === 'web') {
    // 웹에서는 localStorage 사용
    try {
      let uuid = localStorage.getItem(UUID_KEY);
      
      if (!uuid) {
        // 웹에서는 crypto.randomUUID() 사용 (모던 브라우저에서 지원)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          uuid = crypto.randomUUID();
        } else {
          // 폴백: 간단한 UUID 생성
          uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
        localStorage.setItem(UUID_KEY, uuid);
      }
      
      return uuid;
    } catch (error) {
      console.error("Could not get/set device UUID", error);
      return 'web-fallback-' + Date.now();
    }
  } else {
    // 네이티브에서는 SecureStore 사용
    let uuid = await SecureStore.getItemAsync(UUID_KEY);
    
    if (!uuid) {
      uuid = Crypto.randomUUID();
      await SecureStore.setItemAsync(UUID_KEY, uuid);
    }
    
    return uuid;
  }
};

/**
 * Gets the device's IP address on native or returns 'web-client' on web
 * @returns {Promise<string>} The device's IP address.
 */
export const getIPAddress = async (): Promise<string> => {
  if (Platform.OS === 'web') {
    return 'web-client';
  }
  
  try {
    const ipAddress = await Network.getIpAddressAsync();
    return ipAddress;
  } catch (error) {
    console.error("Could not get IP address", error);
    return 'unknown';
  }
};
