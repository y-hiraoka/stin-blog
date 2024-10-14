---
title: "Rust始めてみた。JSONフォーマッターを作ってみた"
createdAt: "2024-10-14T17:53:47.270Z"
tags: ["rust"]
---

唐突にRustを使ってみたいと思ったので勉強を始めてみました。

## 始めた理由

始めてみたかった理由は色々あります。

まずはやはりフロントエンド開発ツールが色々とRustで実装されることです。VercelはTurborepoとTurbopackをRustで実装していますね。JavaScriptコンパイラのSWCもRustで実装されています。あとは、uhyoさんのnitrogqlもRustで作られていて、おもしろいなと思いました。そんな感じで、コンパイラ実装でRustがよく使われていることと、ビルドツールなどのテキスト処理に興味があったのが1つ目の理由です。

あとは、Tauriですね。ふとデスクトップアプリを作りたいと思ったときにTauriを調べたんですが、TauriのバックエンドをRustで書けたらかっこいいなと思いました。普通にJavaScriptでも書けるらしいんですが、かっこよさ重視です。

それとRustをWebAssemblyにビルドしてブラウザで使うこともできるので、いつかブラウザで実行する高負荷な計算を実装するときに役立つかもと思っています(そんな機会が来るかはわかりません)。

## 公式の教材（の和訳）を読んだ

Rustは公式で[The Rust Programming Language](https://doc.rust-lang.org/book/)(通称The Book)というオンライン教材を提供しています。英語で読むのは大変なので、和訳を読んでみました。

https://doc.rust-jp.rs/book-ja/

ただ和訳のメンテナンスが止まっているようなので、情報が古いかもしれません。Rustは破壊的変更が少ないらしいので、基本的なRustの知識は取り入れられると思います。多分。

和訳がメンテナンスされていないのと、ぶっちゃけ和訳が不自然で読みにくいので、お金をかけられる人はオライリーの本を買うのが良いかもしれないです。[t_wada氏もおすすめしていました](https://x.com/t_wada/status/1818821310640013576)。

https://www.oreilly.co.jp/books/9784873119786/

僕は購入済みのほぼ未読です。ボリュームがありすぎて怯む。

## JSONフォーマッターを作ってみた

とりあえずThe Bookで把握した(把握したとは言ってない)Rust知識で、テキスト処理実装の練習も兼ねてJSONフォーマッターを作ってみました。

https://github.com/stinbox/json-formatter

テキスト処理については完全な素人なので、正しいテキスト処理のカタチになっているかはわかりませんが、一応「字句解析(tokenize)」「構文解析(parse)」「整形(format)」の3つのステップで実装しています。

JSONの仕様は[ECMA-404](https://ecma-international.org/publications-and-standards/standards/ecma-404/)を確認しました。

命名規則もあいまいだし、コンパイルエラーを潰すのに手探りだったので、分かる人が見ればツッコミどころ満載なのだろうと思います。将来自分のコードに突っ込めるようになるといいね。

簡単にJSONフォーマッターのコードを説明します。

### 字句解析

字句解析は与えられた文字列をトークンという最小単位に分割する処理です。字句解析のコードはリポジトリの`src/tokenize.rs`にあります。

JSONのトークンはRustのenumを使って次のように表現できます。

```rust
#[derive(Debug, PartialEq, Clone)]
pub enum JsonToken {
    LeftSquareBracket,  // [
    LeftCurlyBracket,   // {
    RightSquareBracket, // ]
    RightCurlyBracket,  // }
    Colon,              // :
    Comma,              // ,
    True,
    False,
    Null,
    String(String),
    Number(f64),
}
```

Rustのenumで感動したことは、enumに関連データを持たせることができることです(C#とTypeScriptしか知らない人並感)。それも列挙子ごとに異なる任意のデータ型で。TypeScriptで言えばタグ付きユニオンに似ていますが、Rustにはmatch式もあるのでより使い勝手が良い印象です。

関連データとして、`JsonToken::String`には実際のテキストを`String`型で持たせます。`JsonToken::Number`には`f64`型です。

`#[derive()]`の部分はマクロです。未熟なので説明はできませんが、コンパイル時に勝手にメソッドを生やしてくれるべんりなやつです。とりあえずコンパイラに入れろと言われたやつを指定しました(？)

Rustにはエラーのthrowがないので、エラーは`Result`型で表現します。`Result`も本質的にはただのenumです。自前のエラー型を用意して、パースに成功したら`JsonToken`のリスト(ベクタ)を含み、失敗したらエラーを含むような`Result`型を関数から返します。

```rust
#[derive(Debug, PartialEq)]
pub enum JsonTokenizeError {
    UnexpectedLiteral(String),
    UnexpectedCharacter(char),
    UnexpectedEndOfInput,
    InvalidEscapeCharacter(String),
    InvalidNumberLiteral(String),
}

type JsonTokenizeResult = Result<Vec<JsonToken>, JsonTokenizeError>;

pub fn tokenize(input: &str) -> JsonTokenizeResult {
  // ...
}
```

`type JsonTokenizeResult`の部分は型エイリアスで、名前をつけているだけですね。繰り返し同じ型を使うときに便利です。`Vec`は可変長配列です。

続いて`tokenize`関数の内部実装です。

```rust
pub fn tokenize(input: &str) -> JsonTokenizeResult {
    let mut chars = input.chars().peekable();
    let mut tokens = Vec::new();

    while let Some(&char) = chars.peek() {
        match char {
            ' ' | '\n' | '\t' | '\r' => {
                chars.next();
            }
            '[' => {
                chars.next();
                tokens.push(JsonToken::LeftSquareBracket);
            }
            '{' => {
                chars.next();
                tokens.push(JsonToken::LeftCurlyBracket);
            }
            ']' => {
                chars.next();
                tokens.push(JsonToken::RightSquareBracket);
            }
            '}' => {
                chars.next();
                tokens.push(JsonToken::RightCurlyBracket);
            }
            ':' => {
                chars.next();
                tokens.push(JsonToken::Colon);
            }
            ',' => {
                chars.next();
                tokens.push(JsonToken::Comma);
            }
            '"' => match tokenize_string(&mut chars) {
                Ok(token) => tokens.push(token),
                Err(err) => return Err(err),
            },
            '-' | '0'..='9' => match tokenize_number(&mut chars) {
                Ok(token) => tokens.push(token),
                Err(err) => return Err(err),
            },
            _ => match tokenize_literal(&mut chars) {
                Ok(token) => tokens.push(token),
                Err(err) => return Err(err),
            },
        }
    }

    Ok(tokens)
}
```

~~面倒なので~~紙面の都合上、`tokenize_string`、`tokenize_number`、`tokenize_literal`関数の実装は省略します。興味があればリポジトリを御覧ください。中身はJSON仕様に従って泥臭い処理をしているだけです。

ここでもRustの感動ポイントがあります。

まずは`&str`型(文字列型のひとつ)から「`char`型の値を順番に取得できるイテレーター」を生成する`.chars()`メソッドを使うのですが、続けて`.peekable()`メソッドも呼んでいます。これを使うことで`.peek()`というメソッドが生えたPeekableイテレーターを取得できます。peekというのは、次に控えている値をチラ見するがイテレーターの状態を変更しない、という便利なインターフェイスです。

`tokenize`関数で`while let`と`chars.peek()`で値を1文字ずつ先読みし続けて、その内側の`match`式でトークンに変換していきます。`match`式はTypeScriptにはない機能で、パターンマッチングというのができます。とにかく強力です(知ったかぶり)。TypeScriptのswitch文に似ている気がしますが、文ではなく式なので値を返せたり、パターン中で変数を用意できたり、とにかく強力です。

`while let`の内側で`chars.next()`を呼び出しているので、どんどんイテレーターの要素が減っていき、いずれループが停止します。すべての文字を読み終えたら`Ok(tokens)`を返しています。最後の`return`が不要なのもRustの特徴ですね(慣れない)。

Rustは言語レベルで単体テストがサポートされていて、同じファイルでテストコードが書けます。次のようにテストコードを書きました。

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tokenize_empty() {
        let input = "";
        let actual = tokenize(&input);
        let expected = Ok(vec![]);
        assert_eq!(actual, expected);
    }

    #[test]
    fn tokenize_left_square_bracket() {
        let input = "[";
        let actual = tokenize(&input);
        let expected = Ok(vec![JsonToken::LeftSquareBracket]);
        assert_eq!(actual, expected);
    }

    #[test]
    fn tokenize_right_square_bracket() {
        let input = "]";
        let actual = tokenize(&input);
        let expected = Ok(vec![JsonToken::RightSquareBracket]);
        assert_eq!(actual, expected);
    }

    // ...
}
```

`#[cfg(test)]`や`#[test]`を付けておくと、リリースビルド時にはテストコードが無視されるなどコンパイラがいい感じにビルドしてくれるようです。`assert_eq!`は値を2つ比較して、一致していない場合はエラーで強制停止するマクロです。テストを書いたら`cargo test`でテストを実行できます。

### 構文解析

構文解析では、字句解析で得られたトークンの列をJSONの値として評価します。構文解析のコードはリポジトリの`src/parser.rs`にあります。

JSONの値はenumを使って次のように定義しました。

```rust
#[derive(Debug, PartialEq)]
pub enum JsonValue {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<JsonValue>),
    Object(Vec<(String, JsonValue)>),
}
```

`JsonValue::Object`の関連データ型がMap系ではなく`Vec<(String, JsonValue)>`になっているのは意図的です。最終的な目的がJSONフォーマットなので、入力順序を保持する必要があったのですが、Rustの標準ライブラリには挿入順序を保持するMapがありませんでした。また、フォーマットが目的であって、キーで値を取り出したいわけではないので、キーバリューをセットで格納した`Vec`で十分だと判断しました。

構文解析中のエラー型も定義します。

```rust
#[derive(Debug, PartialEq)]
pub enum JsonParserError {
    UnexpectedToken(JsonToken),
    UnexpectedEndOfInput,
}
```

そして`parser`関数の実装です。

```rust
pub fn parser(tokens: &Vec<JsonToken>) -> Result<JsonValue, JsonParserError> {
    let mut tokens = tokens.iter().peekable();
    let result = parser_value(&mut tokens);
    if let Some(&token) = tokens.peek() {
        return Err(JsonParserError::UnexpectedToken(token.clone()));
    };
    result
}

fn parser_value(
    mut tokens: &mut Peekable<Iter<'_, JsonToken>>,
) -> Result<JsonValue, JsonParserError> {
    if let Some(&token) = tokens.peek() {
        match token {
            JsonToken::Null => {
                tokens.next();
                Ok(JsonValue::Null)
            }
            JsonToken::True => {
                tokens.next();
                Ok(JsonValue::Bool(true))
            }
            JsonToken::False => {
                tokens.next();
                Ok(JsonValue::Bool(false))
            }
            JsonToken::Number(number) => {
                tokens.next();
                Ok(JsonValue::Number(*number))
            }
            JsonToken::String(string) => {
                tokens.next();
                Ok(JsonValue::String(string.clone()))
            }
            JsonToken::LeftSquareBracket => parser_array(&mut tokens),
            JsonToken::LeftCurlyBracket => parser_object(&mut tokens),
            _ => Err(JsonParserError::UnexpectedToken(token.clone())),
        }
    } else {
        Err(JsonParserError::UnexpectedEndOfInput)
    }
}
```

`tokenize`の戻り値の成功側が`Vec<JsonToken>`なので、それをそのまま受け取れるように`parser`の引数を`&Vec<JsonToken>`としています。`&`をつけることで値を借用しているだけで、所有権を奪わないことを示しています。これで`parser`関数を抜けても`tokens`の値がメモリから破棄されなくなります。また、`mut`は引数もミューテーションすることを宣言しています。Rustでは変数がデフォルトでイミュータブルなので、関数を使う側も`let mut`で宣言した変数だけを渡せます。多分。未熟なので説明できません。コンパイラ様の仰せのままに。

`parser`関数と`parser_value`関数を分けています。これは関数を再帰的に呼び出すときに`Vec`ではなくPeekableイテレーターを取り回したかったためです。`pub`をつけると外部から利用可能になり、付けないとプライベート利用のみ可能になります。外から見た時`parser`関数だけが目的なので、`parser`関数だけを公開しています。`parser_array`, `parser_object`関数も同様です。

`parser_value`関数では、JSONの値として評価できるトークンを順番に確認しています。`JsonToken::Null`、`JsonToken::Bool`、`JsonToken::Number`、`JsonToken::String`はそのまま値と判断できるので、`Ok(JsonValue)`を返します。`JsonToken::Array`、`JsonToken::Object`はちょっと複雑なので、別の関数に処理を委譲します。その中でまた`parser_value`を再帰的に呼び出しています(泥臭いコード略)。コロンやカンマなどその他のトークンは値の先頭に来ることはないので`Err`を返します。

JSONの仕様的には、`null`単体とか`true`だけみたいな文字列もvalidなJSONなので、それも適切にparseできるようになっています。

`parser`(厳密には`parser_value`)関数では、ひとつのpeekableイテレーターを再帰的に渡してちょっとずつ消費していくイメージです。もし`parser`を終了しようとしたときにトークンが消費し切っていなければ不正なJSONとしてエラーを返します(消費し切らない文字列の例：`null null`)。

`parser`もテストを書きます(コード略)。

### 整形

`parser`で得られた`JsonValue`から文字列を組み立てる`format`関数を実装します。整形のコードはリポジトリの`src/formatter.rs`にあります。

```rust
pub fn format(value: &JsonValue) -> String {
    format_value(value, 1)
}

fn format_value(value: &JsonValue, indent_level: usize) -> String {
    match value {
        JsonValue::Null => "null".to_string(),
        JsonValue::Bool(b) => b.to_string(),
        JsonValue::Number(n) => n.to_string(),
        JsonValue::String(s) => format!("\"{}\"", s),
        JsonValue::Object(_) => format_object(value, indent_level),
        JsonValue::Array(_) => format_array(value, indent_level),
    }
}
```

構文解析で不正なJSONは弾かれるので`format`関数が失敗することはなく、戻り値は`Result`型ではなく単に`String`型となります。

整形の処理も`format`と`format_value`に分けています。これは再帰中にインデントのレベルを与える必要がありますが、これも`format`関数を使うサイドには関係のないことなので内部に隠蔽したいからです。

`format_value`では`JsonValue`に対してそれぞれの文字列を返すだけです。`JsonValue::Object`と`JsonValue::Array`は再帰的に処理するために別の関数に処理を委譲しています(泥臭いコード略)。

`JsonValue::String`パターンで使用している`format!()`は、文字列を組み立てるマクロです。`{}`の部分に、後ろで指定した変数を埋め込んだ文字列を返してくれます。RustにはJavaScriptのテンプレートリテラルのような機能はないっぽい。

整形のテストコードでは次のように書けました。

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // ...

    #[test]
    fn format_object_nested() {
        let value = JsonValue::Object(vec![
            ("number".to_string(), JsonValue::Number(123.4)),
            (
                "object".to_string(),
                JsonValue::Object(vec![
                    ("string".to_string(), JsonValue::String("hello".to_string())),
                    (
                        "array".to_string(),
                        JsonValue::Array(vec![
                            JsonValue::Bool(true),
                            JsonValue::Bool(false),
                            JsonValue::Null,
                        ]),
                    ),
                ]),
            ),
        ]);
        let result = format(&value);
        assert_eq!(
            result,
            r#"{
  "number": 123.4,
  "object": {
    "string": "hello",
    "array": [
      true,
      false,
      null
    ]
  }
}"#
        );
    }

    // ...
}
```

テンプレートリテラルではないのですが、`r#""#`で囲むことで改行やエスケープ文字をそのまま文字列として扱えます。JSONのカタチを維持したまま文字列が書けるので、こういったテキスト処理のテストコードで便利ですね。

### CLI 部分

最後に、CLIとして使えるように`src/main.rs`を作成します。コマンドライン引数として一つのJSONファイル名を受け取り、そのファイルの内容をフォーマットして標準出力に出力するようにします。

```rust
use std::{env, fs};

use json_formatter::formatter;
use json_formatter::parser;
use json_formatter::tokenizer;

fn main() {
    let mut args = env::args();

    args.next();

    let filename = match args.next() {
        Some(filename) => filename,
        None => {
            eprintln!("No filename provided");
            std::process::exit(1);
        }
    };

    let content = match fs::read_to_string(&filename) {
        Ok(content) => content,
        Err(error) => match error.kind() {
            std::io::ErrorKind::NotFound => {
                eprintln!("No such file or directory: '{}'", filename);
                std::process::exit(1);
            }
            std::io::ErrorKind::PermissionDenied => {
                eprintln!("Permission denied: '{}'", filename);
                std::process::exit(1);
            }
            _ => {
                eprintln!("Error reading file '{}': {}", filename, error);
                std::process::exit(1);
            }
        },
    };

    // Tokenize
    // Parse
    // Format
}
```

Rustのコード実行は`src/main.rs`の`main`関数から始まります。

`use json_formatter::`で自作のモジュールを利用可能にします。後で使います。

`env::args()`でコマンドライン引数のイテレーターを取得できます。1つ目は実行ファイル名なので消費だけして捨てます。2つ目にファイル名があればそれを読み込み、なければエラーメッセージを出力して終了します。The Bookで学んだテクニック(？)です。

ファイル名を`fs::read_to_string`関数に渡してファイルのテキストデータを取得します。これも`Result`型なので、`match`でエラーかどうかを判定します。エラーの場合は適当にエラーメッセージを出し分けて終了します。`eprintln!`は標準エラー出力にテキストを出力するためのマクロです。

続いて省略した後半部分。実際に`tokenizer`, `parser`, `formatter`関数を呼び出して、JSONファイルをフォーマットします。

```rust
fn main() {
    // ...

    let mut tokens = match tokenizer::tokenize(&content) {
        Ok(tokens) => tokens,
        Err(error) => {
            match error {
                tokenizer::JsonTokenizeError::InvalidEscapeCharacter(character) => {
                    eprintln!("Invalid escape character: '{}'", character);
                }
                tokenizer::JsonTokenizeError::InvalidNumberLiteral(literal) => {
                    eprintln!("Invalid number literal: '{}'", literal);
                }
                tokenizer::JsonTokenizeError::UnexpectedCharacter(character) => {
                    eprintln!("Unexpected character: '{}'", character);
                }
                tokenizer::JsonTokenizeError::UnexpectedEndOfInput => {
                    eprintln!("Unexpected end of input");
                }
                tokenizer::JsonTokenizeError::UnexpectedLiteral(literal) => {
                    eprintln!("Unexpected literal: '{}'", literal);
                }
            }
            std::process::exit(1);
        }
    };

    let parsed = match parser::parser(&mut tokens) {
        Ok(parsed) => parsed,
        Err(error) => {
            match error {
                parser::JsonParserError::UnexpectedEndOfInput => {
                    eprintln!("Unexpected end of input");
                }
                parser::JsonParserError::UnexpectedToken(token) => {
                    eprintln!("Unexpected token: '{}'", token);
                }
            }

            std::process::exit(1);
        }
    };

    let formatted = formatter::format(&parsed);

    println!("{}", formatted);
}
```

エラーメッセージの出し分けで行数が多いですが、やっていることは`tokenize`, `parser`, `format`を順番に呼び出しているだけですね。`tokenize`と`parser`は`Result`型を返すため、都度`match`式で処理の成否をチェックしています。エラーがあればエラーメッセージを出力して終了します。

最後に`format`した文字列を`println!`で標準出力に出力して正常終了します。

これでJSONフォーマッターのCLIが完成しました。ちゃんとリリースビルドの設定をしてないので`cargo run filename.json`で実行して確認しました。リポジトリをクローンすれば未整形のJSONファイルが入っているので、よかったら試してみてください。

## 本当にやりたかったこと

本当は、この自作JSONフォーマッターをWebAssemblyにビルドして、Reactアプリ上のエディターに入力されたJSONをフォーマットするアプリまで作ってみたかったのですが、諦めました。

諦めた理由が、RustのWebAssemblyを構築するクレート(？)である`wasm-bindgen`が、関連データを持つenumをサポートしていないからです([issue](https://github.com/rustwasm/wasm-bindgen/issues/2407))。本記事の上の方でRustの感動ポイントとしてenumが関連データを持つことを挙げたのに、それがWasm変換の障壁になっていたのがショックで諦めました。

Wasmに変換するときはRust側に制約があることを学べたので良かったです。

## まとめ

Rustを始めました。難しいですが楽しいです。

それでは良いRustライフを！
