//
//  BackgroundTask.swift
//
//  Created by Yaro on 8/27/16.
//  Copyright © 2016 Yaro. All rights reserved.
//

import AVFoundation

class BackgroundTask {
    
    // MARK: - Vars
    var player = AVAudioPlayer()
    var timer = Timer()
    
    // MARK: - Methods
    func startBackgroundTask() {
        NotificationCenter.default.addObserver(self, selector: #selector(interruptedAudio), name: AVAudioSession.interruptionNotification, object: AVAudioSession.sharedInstance())
        self.playAudio()
    }
    
    func stopBackgroundTask() {
        NotificationCenter.default.removeObserver(self, name: AVAudioSession.interruptionNotification, object: nil)
        player.stop()
    }
    
    @objc fileprivate func interruptedAudio(_ notification: Notification) {
        if notification.name == AVAudioSession.interruptionNotification && notification.userInfo != nil {
            var info = notification.userInfo!
            var intValue = 0
            (info[AVAudioSessionInterruptionTypeKey]! as AnyObject).getValue(&intValue)
            if intValue == 1 { playAudio() }
        }
    }
    
    fileprivate func playAudio() {
        do {
            let bundle = Bundle.main.path(forResource: "blank", ofType: "wav")
            print("get file path clear!")
            let alertSound = URL(fileURLWithPath: bundle!)
            print("get file URL clear!")
            try AVAudioSession.sharedInstance().setCategory(AVAudioSession.Category.playback)
            print("set AVAudioSession Category clear!")
            try AVAudioSession.sharedInstance().setActive(true)
            print("set AVAudioSeesion setActive clear!")
            try self.player = AVAudioPlayer(contentsOf: alertSound)
            print("set player")
            // Play audio forever by setting num of loops to -1
            self.player.numberOfLoops = -1
            self.player.volume = 0.01
            self.player.prepareToPlay()
            print("prepareToPlay clear!")
            self.player.play()
            print("*******")
            print("playing blank audio")
        } catch {
          print("******BackgroundTask Infinite Error")
          print(error)
          
      }
    }
}
