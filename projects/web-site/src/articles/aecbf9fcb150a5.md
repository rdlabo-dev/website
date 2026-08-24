---
title: "Comparing Plugin Code in Capacitor, Flutter, and React Native"
description: "Side-by-side Kotlin echo plugins for Capacitor, React Native, and Flutter show how each framework registers methods and bridges to JavaScript."
zennSlug: aecbf9fcb150a5
emoji: "💬"
---

I often see people mix view implementation with plugin development across Capacitor, Flutter, and React Native.

Here, a plugin is the bridge from Capacitor, Flutter, or React Native views through platform APIs to Swift or Kotlin. Plugins expose native camera and sensor APIs, third-party SDKs, Facebook login, AdMob, payments, and more.

Plugins are easy to treat as black boxes. As a first step toward understanding them, compare minimal Kotlin plugins that only `echo` back a string.

# Capacitor plugin

In a Capacitor Android plugin, methods on a class annotated with `@CapacitorPlugin` and marked `@PluginMethod` become plugin methods. The method name is the function name.

```kotlin
@CapacitorPlugin(name = "MyPlugin")
class MyPlugin : Plugin() {
    @PluginMethod
    fun echo(call: PluginCall) {
        val value = call.getString("value") ?: ""
        call.success(JSObject().put("value", value))
    }
}
```

Reflecting the plugin into the project is easy: after install, run:

```bash
% npx cap update
```

Then use it from the view like this:

```js
import { MyPlugin } from 'capacitor-plugin-my-plugin';

const ret = await MyPlugin.echo({ value: 'Hello' });
console.log(ret.value); // Hello
```

Simple.

## React Native plugin

In React Native, override `getName` on `ReactContextBaseJavaModule` to register the plugin name. Like Capacitor, `@ReactMethod` functions become method names.

```kotlin
class MyPluginModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "MyPlugin"
    }

    @ReactMethod
    fun echo(value: String?, promise: Promise) {
        val result = mapOf("value" to (value ?: ""))
        promise.resolve(result)
    }
}
```

To use the plugin, add it to `getPackages` in the project—the part Capacitor handles with `npx cap update`.

```diff:java
+ import com.example.myplugin.MyPluginPackage; // Add this import

  @Override
  protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
+         new MyPluginPackage()
      );
  }
```

Then call it from the view via `NativeModules`.


```js
import { NativeModules } from 'react-native';
const { MyPlugin } = NativeModules;

const result = await MyPlugin.echo("Hello");
console.log(result.value); // Output: Hello
```


## Flutter plugin

A Flutter plugin runs lifecycle methods when the plugin attaches and detaches. Registration happens on attach, so you use that lifecycle (detach cleanup is optional).

When a method is invoked, `onMethodCall` runs and you branch on `call.method`.

```kotlin
class MyPlugin : FlutterPlugin, MethodChannel.MethodCallHandler {
    private lateinit var channel: MethodChannel

    override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(flutterPluginBinding.binaryMessenger, "my_plugin")
        channel.setMethodCallHandler(this)
    }

    override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }

    override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: MethodChannel.Result) {
        when (call.method) {
            "echo" -> {
                val value = call.argument<String>("value") ?: ""
                val ret = mapOf("value" to value)
                result.success(ret)
            }
            else -> result.notImplemented()
        }
    }
}
```

Typical Dart usage looks like this. A `MyPlugin` wrapper is not required, but registering the plugin before runtime is recommended to control attach/detach timing.


```dart
import 'package:flutter/services.dart';

class MyPlugin {
  static const MethodChannel _channel = MethodChannel('my_plugin');

  static Future<Map<String, dynamic>> echo(String value) async {
    final result = await _channel.invokeMethod('echo', {'value': value});
    return Map<String, dynamic>.from(result);
  }
}

void main() async {
  final response = await MyPlugin.echo("Hello");
  print(response['value']); // Output: Hello
}
```

# Summary

View design differs, and plugin architecture reflects each framework's philosophy—that is part of the fun.

I use Capacitor. I find React Native's `promise.resolve` more intuitive from the view than Capacitor's habitual `call.resolve`, while `npx cap update` auto-wiring into the project is extremely convenient.

Flutter's `call.method` dispatch is interesting too. You can run shared validation before methods (for example checking `initialize` completed)—very handy.

Either way, native code stays native (Swift or Kotlin), so performance and maintenance cost are roughly the same across frameworks.

Do not leave plugins as black boxes—dig in and enjoy building.

See you next time.
