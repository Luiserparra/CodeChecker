import React from 'react';
import './App.css';
import * as fs from "fs";
import { Document, Packer, Paragraph, TextRun } from "docx";

var mammoth;
const $ = window.$;
var gRes = '';
class CodeChecker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code1: false,
      code2: false,
      code1Txt: '',
      code2Txt: ''
    }
    this.handleChange = this.handleChange.bind(this);
    mammoth = require('mammoth');
  }
  handleChange(event) {
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
                  <input type="file" id="1" name="code1" onChange={this.handleChange} />
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
                  <input type="file" id="2" name="code2" onChange={this.handleChange} />
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path validate" type="text" placeholder="Upload teacher's code" />
                </div>
              </div>
            </form>
          </div>
          <div className="col s4">
            <a className="waves-effect waves-light btn-large DownloadBtn"><i className="material-icons right">file_download</i>Download</a>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount = () => {
    //const text = new TextRun({text: "and then underlined ",underline: {},}); //Underline
    //text.strike(); //Rayar
    //text.break();  // cambio de linea

    $('.DownloadBtn').click(() => {
      if (gRes !== '') {
        const doc = new Document();
        const paragraph = this.createParagraph();
        doc.addSection({
          children: [paragraph],
        });
        Packer.toBlob(doc).then((blob) => {
          var link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = "Código revisado.docx";
          link.click();
        });
      } else {
        console.log('Nel pa');
      }
    });
  }

  parseWordDocxFile = e => {
    let file = e.target.files[0];
    let id = e.target.id;
    let name = e.target.name;
    if (!file) {
      this.changeState(name, false, name + 'Txt', '');
      if ($('#' + id).parents(".col").children().first().hasClass('card-panel')) {
        $('#' + id).parents(".col").children().first().remove();
      }
      return;
    }
    var reader = new FileReader();
    reader.onload = (event) => {
      var arrayBuffer = reader.result;
      mammoth.convertToMarkdown({ arrayBuffer: arrayBuffer }).then((resultObject) => {
        let html = resultObject.value;
        html = html.replace(/\\/g, "");
        //html = html.replace(/\n\n/g, "\n");
        if ($('#' + id).parents(".col").children().first().hasClass('card-panel')) {
          $('#' + id).parents(".col").children().first().remove();
        }
        $('#' + id).parents(".col").prepend('<div class="card-panel white"><span><pre><code>' + html + '</code></pre></span></div>');
        this.changeState(name, true, name + 'Txt', html);
      })
    };
    reader.readAsArrayBuffer(file);

  }

  changeState = (name, full, nameTxt, code) => {
    this.setState({ [name]: full, [nameTxt]: code });
    setTimeout(() => { this.CodeChecker() }, 100);
  }

  CodeChecker = () => {
    if (this.state.code1 && this.state.code2) {
      let code1 = this.state.code1Txt;
      let code2 = this.state.code2Txt;
      let res = this.diffString(code1, code2);
      res = res.replace(/%u2190/g, '&larr;');
      res = res.replace(/\t /g, '\t');
      res = res.replace(/%09/g, '\t');
      res = res.replace(/  /g, ' ');
      gRes = res;
      gRes = gRes.replace(/\n\n/g, '\n');
      gRes = gRes.trim();
      if ($('.DownloadBtn').parents('.col').children().first().hasClass('card-panel')) {
        $('.DownloadBtn').parents('.col').children().first().remove();
      }
      $('.DownloadBtn').parents('.col').prepend('<div class="card-panel white"><span><pre><code>' + res + '</code></pre></span></div>');
    } else {
      console.log("Falta codigo");
    }
  }


  escape = (s) => {
    var n = s;
    n = n.replace(/&/g, "&amp;");
    n = n.replace(/</g, "&lt;");
    n = n.replace(/>/g, "&gt;");
    n = n.replace(/"/g, "&quot;");
    //n = n.replace(/\t/, "");
    return n;
  }

  //Funcion para diferencias y procesar los Strings
  diffString = (o, n) => {
    //Quita espacios en blanco al final de los Strings
    o = o.replace(/\s+$/, '');
    n = n.replace(/\s+$/, '');

    //Si un String es vacio manda un vector vacio sino manda el String dividido por espacios
    //var out = this.diff(o === "" ? [] : o.split(/\s+/), n === "" ? [] : n.split(/\s+/)); 
    var out = this.diff(o === "" ? [] : o.split('\n\n').join(' ').split(/ +/), n === "" ? [] : n.split('\n\n').join(' ').split(/ +/));
    var str = "";
    var oSpace = o.match(/\s+/g);
    if (oSpace == null) {
      oSpace = ["\n"];
    } else {
      oSpace.push("\n");
    }
    var nSpace = n.match(/\s+/g);
    if (nSpace == null) {
      nSpace = ["\n"];
    } else {
      nSpace.push("\n");
    }

    /*
    for(var i = 0;i < oSpace.length ;i++){
      oSpace[i] = oSpace[i].replace(/\t+/,'');
    }                                               // Para resaltar toda la linea toda la linea
    for(var i = 0;i < nSpace.length ;i++){
      nSpace[i] = nSpace[i].replace(/\t+/,'');
    }
    */

    for (var i = 0; i < out.n.length; i++) {
      if (out.n[i].text != null) {
        out.n[i].text = out.n[i].text.replace(/\t+/, '');
      } else {
        out.n[i] = out.n[i].replace(/\t+/, '');
      }
    }

    for (var i = 0; i < out.o.length; i++) {
      if (out.o[i].text != null) {
        out.o[i].text = out.o[i].text.replace(/\t+/, '');
      } else {
        out.o[i] = out.o[i].replace(/\t+/, '');
      }
    }


    if (out.n.length === 0) {
      for (var i = 0; i < out.o.length; i++) {
        str += '<del>' + this.escape(out.o[i]) + "</del>" + oSpace[i];
      }
    } else {
      if (out.n[0].text == null) {
        for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
          str += '<del>' + this.escape(out.o[n]) + "</del>" + oSpace[n];
        }
      }

      for (var i = 0; i < out.n.length; i++) {
        if (out.n[i].text == null) {
          str += '<ins>' + this.escape(out.n[i]) + "</ins>" + nSpace[i];
        } else {
          var pre = "";

          for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
            pre += '<del>' + this.escape(out.o[n]) + "</del>" + oSpace[n - 1];
          }
          str += " " + out.n[i].text + nSpace[i] + pre;
        }
      }
    }

    return str;
  }


  //Funcion para encontrar las diferencias entre los Strings
  diff = (o, n) => {

    //Cada vector de entrada tiene su vector auxiliar de objetos
    var ns = new Object();
    var os = new Object();
    console.log(o);
    console.log(n);

    //Llena el objeto con las posiciones de cada palabra para n

    for (var i = 0; i < n.length; i++) {
      if (ns[n[i]] == null)
        ns[n[i]] = { rows: new Array(), o: null };
      ns[n[i]].rows.push(i);
    }
    //Llena el objeto con las posiciones de cada palabra para o

    for (var i = 0; i < o.length; i++) {
      if (os[o[i]] == null)
        os[o[i]] = { rows: new Array(), n: null };
      os[o[i]].rows.push(i);
    }
    //Va seleccionando las palabras unicas que estan donde deberian estar
    for (var i in ns) {
      if (ns[i].rows.length == 1 && typeof (os[i]) != "undefined" && os[i].rows.length == 1) {
        n[ns[i].rows[0]] = { text: n[ns[i].rows[0]], row: os[i].rows[0] };
        o[os[i].rows[0]] = { text: o[os[i].rows[0]], row: ns[i].rows[0] };
      }
    }



    for (var i = 0; i < n.length - 1; i++) {
      if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[n[i].row + 1].text == null &&
        n[i + 1] == o[n[i].row + 1]) {
        n[i + 1] = { text: n[i + 1], row: n[i].row + 1 };
        o[n[i].row + 1] = { text: o[n[i].row + 1], row: i + 1 };
      }
    }

    for (var i = n.length - 1; i > 0; i--) {
      if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[n[i].row - 1].text == null &&
        n[i - 1] == o[n[i].row - 1]) {
        n[i - 1] = { text: n[i - 1], row: n[i].row - 1 };
        o[n[i].row - 1] = { text: o[n[i].row - 1], row: i - 1 };
      }
    }
    return { o: o, n: n };
  }

  createParagraph() {
    var paragraph = new Paragraph('');
    var spaceNchanges = gRes.match(/(<del>.*?<\/del>)|(<ins>.*?<\/ins>)|(\s)/g);
    console.log(spaceNchanges);
    var temp = gRes.replace(/(<del>.*?<\/del>)|(<ins>.*?<\/ins>)|(\s)/g, '&empty;');
    console.log(temp);
    var all = temp.split(/(&empty;)/);
    var all = all.filter((el) => {
      return el != '';
    });
    var cont = 0;
    console.log(all);
    for (var i = 0; i < all.length; i++) {
      if (all[i] === '&empty;') {
        all[i] = spaceNchanges[cont];
        cont++;
      }
    }
    console.log(all);
    for (var i = 0; i < all.length; i++) {
      var txt;
      if (all[i].includes('<del>')) {
        var t = all[i].replace('<del>', '').replace('</del>', '');
        txt = new TextRun({
          text: t,
          color: 'FF1010',
          strike: true
        });
        paragraph.addChildElement(txt);
      } else {
        if (all[i].includes('<ins>')) {
          var t = all[i].replace('<ins>', '').replace('</ins>', '');
          txt = new TextRun({
            text: t,
            underline: {},
            color: '10FF10'
          });
          paragraph.addChildElement(txt);
        }else{
          if(all[i]==='\n'){
            txt = new TextRun('').break();
            paragraph.addChildElement(txt);
          }else{
            txt = new TextRun(all[i]);
            paragraph.addChildElement(txt);
          }
        }
      }
    }
    return paragraph;
  }

}
export default CodeChecker;
