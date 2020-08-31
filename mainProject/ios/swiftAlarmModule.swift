//
//  iosAlarmModule.swift
//  labtest
//
//  Created by skku2 on 2020/08/31.
//

import Foundation
import UIKit
import UserNotifications
import EventKit
import AVFoundation

@objc(swiftAlarmModule)
class swiftAlarmModule: NSObject, UNUserNotificationCenterDelegate {

    @IBOutlet weak var myDatePicker: UIDatePicker!
//    let appDelegate = UIApplication.shared.delegate as! AppDelegate
    
    lazy var player: AVQueuePlayer = self.makePlayer()

    //time data
    var nowTimeHour: Int?
    var nowTimeMinute: Int?
    var targetHour: Int?
    var targetMinute: Int?
    
    //player flag
    var isPlayConfirm = false
    
    
    // MARK: 알람, 알림 초기화
    @objc func initAlarm() {
//        super.viewDidLoad()
      
      //AVAudioPlayer Setting
      do {
        try AVAudioSession.sharedInstance().setCategory(
          AVAudioSession.Category.playAndRecord,
          mode: .default,
          options: []
        )
      } catch {
        print("Failed to set audio session category.  Error: \(error)")
      }
      
      //AVAudioPlayer check time
      player.addPeriodicTimeObserver(forInterval: CMTimeMake(value: 1, timescale: 100), queue: DispatchQueue.main) {
        [weak self] time in
        guard let self = self else { return }
        let timeString = String(format: "%02.2f", CMTimeGetSeconds(time))
        
        if UIApplication.shared.applicationState == .active {
//            self.timeLabel.text = timeString
        } else {
          print("Background: \(timeString)")
        }
      }
      
      //MARK: make scheduler to update time
      Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: #selector(updateTime), userInfo: nil, repeats: true)
      
      
      // MARK: Notification Options
      UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge, .criticalAlert], completionHandler: { (didAllow, error) in
          
      })
      UNUserNotificationCenter.current().delegate = self
    }
    
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
      if keyPath == "currentItem", let player = object as? AVPlayer,
        let currentItem = player.currentItem?.asset as? AVURLAsset {
//        songLabel.text = currentItem.url.lastPathComponent
      }
    }
    
    //take song list
    private lazy var songs: [AVPlayerItem] = {
      let songNames = ["Self-voice"]
      return songNames.map {
        let url = Bundle.main.url(forResource: $0, withExtension: "wav")!
        return AVPlayerItem(url: url)
      }
    }()
    
    //make music player
    private func makePlayer() -> AVQueuePlayer {
      let player = AVQueuePlayer(items: songs)
      player.actionAtItemEnd = .advance
      player.addObserver(self, forKeyPath: "currentItem", options: [.new, .initial] , context: nil)
      return player
    }
    
    @objc func pauseAlarm() {
        if isPlayConfirm{
            player.pause()
        }
    }

    //update time data and check alarm
    @objc func updateTime(){
        var formatter = DateFormatter() // 특정 포맷으로 날짜를 보여주기 위한 변수 선언
        formatter.dateFormat = "HH" // get hour
        nowTimeHour = Int(formatter.string(from: Date()))
        
        formatter = DateFormatter() // 특정 포맷으로 날짜를 보여주기 위한 변수 선언
        formatter.dateFormat = "mm" // get minute
        nowTimeMinute = Int(formatter.string(from: Date()))
        
        print("hour=\(nowTimeHour!) minute=\(nowTimeMinute!)")
        
        //타겟 시간이 존재할 때만 알람 체크
        if targetHour != nil && targetMinute != nil && !isPlayConfirm{
            //현재 시간과 타겟 시간이 같다면?
            if nowTimeHour! == targetHour! && nowTimeMinute! == targetMinute!{
                player.play()
                isPlayConfirm = true
                
                //call updateTime() after 60s
                //알람이 울린 후 알람 소리를 멈추면 60초 후부터 타겟 시간 확인하게 하기
                Timer.scheduledTimer(timeInterval: 60.0, target: self, selector: #selector(self.timerOn), userInfo: nil, repeats: false)
            }
        }
    }
    
    //init flag
    @objc func timerOn(){
        isPlayConfirm = false
    }
    
    //타겟 시간(알람 시간) 설정
  @objc func setAlarmTime(_ hour:NSInteger, minute:NSInteger) -> Void{
        //swift datepicker에서 날짜, 시간 정보 가져오기
//        let datepickerComponent = Calendar.current.dateComponents([.hour, .minute], from:myDatePicker.date)
        print("-----Alarm Set!!------")
        print("\(hour), \(minute)")
        targetHour = hour
        targetMinute = minute
    
        initAlarm()
        clickButton()
    }
    
    
    
    
    //MARK:set alarm and notification
    @objc func clickButton() {

        print("button pressed")
        
//        setTargetTime()
        
        let datepickerComponent = Calendar.current.dateComponents([.hour, .minute], from:myDatePicker.date)
        
        //Setting content of the notification
        let content = UNMutableNotificationContent()
        content.title = "title:\(datepickerComponent.hour!):\(datepickerComponent.minute)"
        content.subtitle = "Subtitle"
        content.body = "This is Body"
        content.summaryArgument = "Alan Walker"
        content.summaryArgumentCount = 40
        let soundName = UNNotificationSoundName(rawValue: "Self-voice.aiff")
        content.sound = UNNotificationSound.init(named: soundName)
        
        //Setting time for notification trigger
        //블로그 예제에서는 TimeIntervalNotificationTrigger을 사용했지만, UNCalendarNotificationTrigger사용법도 같이 올려놓을게요!
        
        //1. Use UNCalendarNotificationTrigger
        let date = Date()
        var dateCompenents = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
        
        
        dateCompenents.hour = datepickerComponent.hour!
        dateCompenents.minute = datepickerComponent.minute!
//        dateCompenents.second = 0
        
        print(datepickerComponent.hour)
        print(datepickerComponent.minute)
        
        let calendartrigger = UNCalendarNotificationTrigger(dateMatching: dateCompenents, repeats: true)
        
        
        //2. Use TimeIntervalNotificationTrigger
        //시간 간격을 두고 time trigger 발생
        let TimeIntervalTrigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.1, repeats: false)
        
        //Adding Request
        // MARK: - identifier가 다 달라야만 Notification Grouping이 됩니닷..!!
        let request = UNNotificationRequest(identifier: "\(index)timerdone", content: content, trigger: calendartrigger)
        
        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
        
    }
}
