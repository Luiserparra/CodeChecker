import React from 'react';
import './App.css';

var mammoth;
const $ = window.$;
class CodeChecker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
    this.handleChange = this.handleChange.bind(this);
    mammoth = require('mammoth');
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
    this.parseWordDocxFile(event);
  }
  render() {
    return (
      <div className="App">
        <nav>
          <div className="nav-wrapper light-blue darken-4">
            <a href="#" className="brand-logo center">CodeChecker</a>
          </div>
        </nav>
        <div className="row">
          <div className="col s4" id="id1">
            <form action="#">
              <div className="file-field input-field">
                <div className="btn">
                  <span>File</span>
                  <input type="file" id="1" onChange={this.handleChange} />
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path validate" type="text" placeholder="Upload your code" />
                </div>
              </div>
            </form>
          </div>
          <div className="col s4" id="id2">
            <form action="#">
              <div className="file-field input-field">
                <div className="btn">
                  <span>File</span>
                  <input type="file" id="2" onChange={this.handleChange} />
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path validate" type="text" placeholder="Upload teacher's code" />
                </div>
              </div>
            </form>
          </div>
          <div className="col s4">

          </div>
        </div>
      </div>
    );
  }

  parseWordDocxFile(e) {
    let file = e.target.files[0];
    let id = e.target.id;
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (event) {
      var arrayBuffer = reader.result;
      mammoth.convertToMarkdown({ arrayBuffer: arrayBuffer }).then(function (resultObject) {
        console.log(resultObject.value);
        console.log(JSON.stringify(resultObject.value));
        let html = resultObject.value;
        html = html.replace(/\\/g, "");
        //html = html.replace(/\n\n/g, "\n");
        if($('#' + id).parents(".col").children().first().hasClass('card-panel')){
          $('#' + id).parents(".col").children().first().remove();
        }
        $('#' + id).parents(".col").prepend('<div class="card-panel white"><span><pre><code>'+html+'</code></pre></span></div>');
      })
    };
    reader.readAsArrayBuffer(file);
  }
}
export default CodeChecker;
