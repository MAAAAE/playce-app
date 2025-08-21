import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as Network from 'expo-network';

const UUID_KEY = 'deviceUUID';

/**
 * Retrieves the stored UUID from SecureStore. 
 * If it doesn't exist, generates a new one, stores it, and returns it.
 * @returns {Promise<string>} The device's unique UUID.
 */
export const getDeviceUUID = async (): Promise<string> => {
  let uuid = await SecureStore.getItemAsync(UUID_KEY);
  
  if (!uuid) {
    uuid = Crypto.randomUUID();
    await SecureStore.setItemAsync(UUID_KEY, uuid);
  }
  
  return uuid;
};

/**
 * Gets the device's IP address.
 * @returns {Promise<string>} The device's IP address.
 */
export const getIPAddress = async (): Promise<string> => {
  try {
    const ipAddress = await Network.getIpAddressAsync();
    return ipAddress;
  } catch (error) {
    console.error("Could not get IP address", error);
    return 'unknown';
  }
};
