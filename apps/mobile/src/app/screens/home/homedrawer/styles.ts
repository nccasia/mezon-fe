import { StyleSheet, Dimensions } from 'react-native';

const inputWidth = Dimensions.get('window').width * 0.6;
const inputWidthWhenHasInput = Dimensions.get('window').width * 0.7;
export const styles = StyleSheet.create({
  mainList: {
    height: '100%',
    width: '78%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden'
  },
  listHeader: {
    width: '100%',
    height: 50,
    borderTopLeftRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopRightRadius: 10,
    marginBottom: 10
  },
  titleHeaderChannel: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18
  },
  wrapperChatBox: {
    minHeight: 80,
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputStyle: {
    height: 40,
    width: inputWidth,
    borderBottomWidth: 0,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  iconEmoji: {
    position: 'absolute',
    right: 10,
  },
  iconSend: {
    backgroundColor: '#5865F2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerDrawerContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2b2d31'
  },
  homeDefault: {
    backgroundColor: '#2b2d31',
    flex: 1
  },
  listChannels: {
    height: '100%',
    flexDirection: 'column-reverse'
  }
});
