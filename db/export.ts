import { Platform, PermissionsAndroid, Share, Alert } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Export SQLite database file (react-native-sqlite-storage)
 * - Android: copy to Download folder
 * - iOS: copy to Documents folder and open Share sheet
 */
export async function exportDatabase() {
  const dbName = 'myapp.db'; // ⚠️ đổi theo tên DB của bạn
  const packageName = 'com.myapp'; // ⚠️ đổi theo package thật trong AndroidManifest

  try {
    if (Platform.OS === 'android') {
      // ===== ANDROID =====
      const source = `/data/data/${packageName}/databases/${dbName}`;
      const dest = `${RNFS.DownloadDirectoryPath}/${dbName}`;

      // Kiểm tra file có tồn tại không
      const exists = await RNFS.exists(source);
      if (!exists) {
        Alert.alert('Database không tồn tại', `Không tìm thấy: ${source}`);
        return;
      }

      // Xin quyền ghi file (Android 13 trở xuống)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Cấp quyền lưu trữ',
          message: 'Ứng dụng cần quyền để export database ra thư mục Download.',
          buttonPositive: 'OK',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Quyền bị từ chối', 'Không thể export database.');
        return;
      }

      // Copy file sang Download
      await RNFS.copyFile(source, dest);
      Alert.alert('✅ Thành công', `Đã export DB tới: ${dest}`);
      console.log('✅ Exported database to:', dest);
    } else if (Platform.OS === 'ios') {
      // ===== iOS =====
      const source = `${RNFS.LibraryDirectoryPath}/LocalDatabase/${dbName}`;
      const dest = `${RNFS.DocumentDirectoryPath}/${dbName}`;

      const exists = await RNFS.exists(source);
      if (!exists) {
        Alert.alert('Database không tồn tại', `Không tìm thấy: ${source}`);
        return;
      }

      await RNFS.copyFile(source, dest);
      console.log('✅ Copied DB to Documents:', dest);

      // Mở share sheet để gửi file qua AirDrop / Mail / Drive
      await Share.share({
        url: `file://${dest}`,
        message: 'Database file exported',
      });
    } else {
      Alert.alert('⚠️ Không hỗ trợ nền tảng này');
    }
  } catch (err: any) {
    console.error('❌ Export failed:', err);
    Alert.alert('❌ Lỗi export', err.message || 'Không rõ nguyên nhân');
  }
}
