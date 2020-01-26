---
title: Go 인터페이스 구현 시 메서드의 리시버 타입이 중요한 이유
description: 동시성, 병렬성 그리고 Go에 대해 알게된 내용들
createdAt: 2020.01.26
---

# Go 인터페이스 구현 시 메서드의 리시버 타입에 관한 질문과 답변
Go에서 인터페이스를 구현하기 위해서는 해당 인터페이스가 포함하고 있는 메서드를 구현하면 된다. 이 때 구현하는 메서드의 리시버 타입이 값이든 포인터든 상관 없다.
```Go
type I interface {
  m()
}

type S struct {
  val string
}

// 아래 두 개의 구현 중 어느 것을 사용해도 문제 없음.
func (s S) m() {}
func (s *S) m() {}
```
<br>
<br>
하지만 인터페이스 타입의 변수에 해당 인터페이스의 구현체를 할당하게 되면 리시버의 타입이 중요해진다.
##### 1. 컴파일 가능한 코드:
```Go
func (s S) m() {}
var i I = S{}
```

##### 2. 컴파일 가능한 코드:
```Go
func (s S) m() {}
var i I = &S{}
```

##### 3. 컴파일 가능한 코드:
```Go
func (s *S) m() {}
var i I = &S{}
```

##### 4. 컴파일 `불가능한` 코드:
```Go
func (s *S) m() {}
var i I = S{} // compile error
```
<br>
1번과 2번 코드는 리시버 타입이 non-pointer로 선언되어 있다. 따라서 메서드 `m`을 호출하면 인터페이스 타입의 변수 `i`가 담고 있는 값 `S`의 복사본이 전달된다.  
3번과 4번 코드는 리시버 타입이 포인터라는 것만 제외하면 1, 2번과 동일하다. 그러므로 `S`를 복사하는 대신 `S`의 주소가 함수 호출 시 전달된다.
<br>
주소를 참조하기 위해서는 & 연산자를 이용한다. 하지만 4번 코드의 변수 `i`는 주소를 참조할 수 없다. 인터페이스 타입의 변수가 담고 있는 구현체의 값은 addressable하지 않기 때문이다.  
[출처] [https://github.com/golang/go/wiki/MethodSets#interfaces](https://github.com/golang/go/wiki/MethodSets#interfaces)

<br>
### addressable 개념
Go에는 addressable value라는 개념이 존재한다. 말 그대로 [address operator](https://golang.org/ref/spec#Address_operators)(&)로 주소를 참조할 수 있는 값을 의미한다.  
예를 들어 Go에서 함수는 addressable하지 않으므로 & 연산자를 사용할 수 없다.
```Go
package main

import "fmt"

func main() {
	&fmt.Println
}
// compile error: cannot take the address of fmt.Println
```

<br>
인터페이스 타입의 변수가 담고 있는 값이 addressable하다면 다음과 같은 문제가 발생한다.  
[출처] [https://stackoverflow.com/questions/48790663/why-value-stored-in-an-interface-is-not-addressable-in-golang](https://stackoverflow.com/questions/48790663/why-value-stored-in-an-interface-is-not-addressable-in-golang)
```Go
type I interface{}
type A int
type B string

var a A = 5
var i I = a

// A 타입의 포인터 변수가 인터페이스 I의 값을 가리키도록 함.
var aPtr *A
aPtr = &(i.(A)) // 인터페이스가 담고있는 값은 addressable하지 않으므로 실제로는 컴파일되지 않는 코드!

// B 타입의 변수를 선언하고 i에 새로 만들어진 변수를 할당함.
// aPtr은 원래 A 타입 변수의 포인터이지만 B 타입 변수를 가리키게 됨. 따라서 aPtr의 타입에 위반이 일어나게 됨.
// (따라서 인터페이스가 담고있는 값은 addressable하지 않음)
var b B = "hello"
i = b
```

