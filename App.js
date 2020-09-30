import React, {useState} from 'react';
import {
  Button,
  Image,
  FlatList,
  View,
  Dimensions,
  TouchableOpacity,
  PermissionsAndroid,
  Text,
  ToastAndroid,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNImageToPdf from 'react-native-image-to-pdf';
import Pdf from 'react-native-pdf';
var RNFS = require('react-native-fs');

const App = (props) => {
  const ReusableButton = (props) => {
    const {txtStyle, title, style, onPress} = props;
    return (
      <TouchableOpacity
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'center',
            padding: 12,
            borderRadius: 30,
            alignItems: 'center',
            flex: 1,
            marginHorizontal: 3,
          },
          style,
        ]}
        onPress={onPress}>
        <Text
          style={[
            {
              fontSize: 13,
              color: '#153359',
            },
            txtStyle,
          ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const checkError = (err) => {
    if (err.message)
      ToastAndroid.showWithGravity(
        err.message,
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
    else
      ToastAndroid.showWithGravity(
        JSON.stringify(err),
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
  };
  const [images, setImages] = useState([]);
  const [pdf, setPdf] = useState('');
  const [loading, setLoading] = useState(false);
  const openCamera = async () => {
    try {
      const response = await ImagePicker.openCamera({
        cropping: true,
        multiple: true,
        mediaType: 'photo',
        freeStyleCropEnabled: true,
      });
      setImages([...images, response.path]);
    } catch (err) {
      checkError(err);
      console.log('error at open camera', err);
    }
  };
  const openGallery = async () => {
    try {
      const response = await ImagePicker.openPicker({
        cropping: true,
        multiple: true,
        mediaType: 'photo',
        freeStyleCropEnabled: true,
      });
      if (Array.isArray(response)) {
        const newImgs = response.map((item) => item.path);
        setImages([...images, ...newImgs]);
      } else {
        setImages([...images, response.path]);
      }
    } catch (err) {
      checkError(err);
      console.log(err);
    }
  };

  const myAsyncPDFFunction = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setLoading(true);
        const paths = images.map((item) => item.replace('file://', ''));
        const options = {
          imagePaths: paths,
          name: 'PDFName',
        };
        const pdf = await RNImageToPdf.createPDFbyImages(options);
        const randomName = Math.random().toString();
        const dest = RNFS.DownloadDirectoryPath + '/' + randomName + '_pfd.pdf';
        await RNFS.moveFile(pdf.filePath, dest);
        setLoading(false);
        setPdf(dest);
      } else {
        console.log('Permission denied');
      }
    } catch (err) {
      setLoading(false);
      checkError(err);
      console.log(err);
    }
  };
  return (
    <View style={{flex: 1}}>
      <View
        style={{
          padding: 15,
          backgroundColor: '#153359',
          alignItems: 'center',
        }}>
        <Text style={{color: 'white', fontSize: 16}}>
          {pdf.length
            ? 'Pdf downloaded in the downloads folder'
            : 'Selected   Images'}
        </Text>
      </View>
      {pdf.length ? (
        <Pdf
          source={{uri: pdf}}
          onLoadComplete={(numberOfPages, filePath) => {}}
          onPageChanged={(page, numberOfPages) => {}}
          onError={(error) => {
            checkError(error);
          }}
          onPressLink={(uri) => {}}
          style={{
            flex: 1,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
          }}
        />
      ) : (
        <>
          {images.length ? (
            <FlatList
              data={images}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              renderItem={({item, index}) => (
                <TouchableOpacity>
                  <Image
                    source={{uri: item}}
                    style={{
                      // alignSelf: 'center',
                      resizeMode: 'stretch',
                      height: 120,
                      width: (Dimensions.get('screen').width - 30) / 3,
                      margin: 5,
                      // margin: 10,
                      // width: '45%',
                    }}
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#153359',
                }}>
                No image selected
              </Text>
            </View>
          )}

          <View
            style={{
              backgroundColor: '#153359',
              width: '100%',
              paddingVertical: 20,
              paddingHorizontal: 5,
              marginTop: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            {images.length ? (
              <ReusableButton
                title="Generate PDF"
                onPress={myAsyncPDFFunction}
                style={{backgroundColor: 'white'}}
              />
            ) : null}
            <ReusableButton
              title="Open Camera"
              onPress={openCamera}
              style={{backgroundColor: 'white'}}
            />
            <ReusableButton
              title="Open Gallery"
              onPress={openGallery}
              style={{backgroundColor: 'white'}}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default App;
