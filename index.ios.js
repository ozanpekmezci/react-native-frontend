/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    AppRegistry, AsyncStorage, // to Store the Token
    Linking,
    ListView, // to List our Users
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight, // aka Button
    View
} from 'react-native';
import config from './config.js';

export default class AwesomeProject extends Component {
    state = {
        token: String,
        username: String,
        password: String,
        error: String
    };
    constructor() {
        super();
      const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            token: '',
            username: '',
            password: '',
            error: '',
            users: ds
        };
    }
    componentDidMount() {
        this.loadInitialState().done();
    }
    loadInitialState() {
        return AsyncStorage.getItem('token').then((token) => {
            if (token !== null) {
                this.setState({token: token});
                this.getData(token);
            } else {
                this.setState({'error': 'LogIn'})
            }
        }).catch((error) => {
            console.error(error);
        });
    }
    getToken(client_id : string, client_key : string, username : string, password : string) {
        let data = new FormData();
        data.append('grant_type', 'password');
        data.append('client_id', client_id);
        data.append('client_secret', client_key);
        data.append('username', username);
        data.append('password', password);
        console.log(data);
        return fetch('https://secure-escarpment-18518.herokuapp.com/o/token/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: data
        }).then((response) => response.json()).then((responseJson) => {
            console.log(responseJson);
            if (responseJson.hasOwnProperty('error')) {
                this.setState({'error': responseJson.error});
            } else {
                AsyncStorage.setItem('token', responseJson.access_token);
                this.setState({'token': responseJson.access_token});
                this.getData(responseJson.access_token);
            }
        }).catch((error) => {
            console.error(error);
        });
    }
    getData(token : string) {
        console.log(token);
        return fetch('https://secure-escarpment-18518.herokuapp.com/users/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Host': 'secure-escarpment-18518.herokuapp.com'
            }
        }).then((response) => response.json()).then((responseJson) => {
            console.log(responseJson);
            if (responseJson.hasOwnProperty('detail')) {
                this.setState({'error': responseJson.detail});
            } else {
                this.setState({'users': this.state.users.cloneWithRows(responseJson)});
            }
        })

    }
    renderUser(user) {
        return (
            <View style={styles.list}>
                <Text>{user.username}</Text>
            </View>

        )
    }
    render() {
        if (this.state.token) {
            return (<ListView dataSource={this.state.users} renderRow={this.renderUser} style={styles.listView}/>);
        } else {
            return (
                <View style={styles.container}>
                    <Text style={styles.welcome}>
                        Mobil
                    </Text>
                    <TextInput style={styles.textInput} onChangeText={(username) => this.setState({'username': username})} value={this.state.username}/>
                    <TextInput secureTextEntry={true} style={styles.textInput} onChangeText={(password) => this.setState({'password': password})} value={this.state.password}/>
                    <TouchableHighlight onPress={() => this.getToken(config.client_id, config.client_key, this.state.username, this.state.password)} style={styles.button}>
                        <Text>Login</Text>
                    </TouchableHighlight>
                    <Text style={styles.error}>
                        {this.state.error}
                    </Text>
                </View>
            )
        };
    }

}

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
},
list: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    backgroundColor: '#F5FCFF'
},
list_row: {
    flex: 1
},
header: {
    justifyContent: 'center'
},
headertext: {
    fontSize: 20,
    margin: 10
},
welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
},
instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
},
error: {
    textAlign: 'center',
    color: 'red',
    marginBottom: 5
},
listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF'
},
listViewItem: {},
textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1
},
button: {
    backgroundColor: '#eeeeee',
    padding: 10,
    marginRight: 5,
    marginLeft: 5
}
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
