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
import MediaPlayer
import Firebase

extension MPVolumeView {
    static func setVolume(_ volume: Float){
        let volumeView = MPVolumeView()
        let slider = volumeView.subviews.first(where: {$0 is UISlider}) as? UISlider
        
        DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + 0.01) {
            print("-----set volume to \(volume)")
            slider?.value = volume
        }
    }
}

@objc(swiftAlarmModule)
class swiftAlarmModule: UIViewController, UNUserNotificationCenterDelegate  {

//    @IBOutlet weak var myDatePicker: UIDatePicker!
    //    let appDelegate = UIApplication.shared.delegate as! AppDelegate

    //player
    lazy var player: AVQueuePlayer = self.makePlayer()
    
    //looper: takes player
    var playerLooper: AVPlayerLooper!

    //time data
    var nowTimeHour: Int?
    var nowTimeMinute: Int?
    var targetHour: Int?
    var targetMinute: Int?

    //music file name
    var fullFileName: String?
    var fileName: String?
    var fileType: String?
    
    //player flag
    var isPlayConfirm = false


    //check flag; is it alarmed?
    var isAlarmRing: Bool = false
    
    //date when alarm is set
    var alarmDate: String?
    
    //flag; have to pop popscreen?
    var shouldPop: Bool = false
    
    //flag; after test?
    var isPop: Bool = false
    
    //firebase db
    var ref: DatabaseReference!
    
    //testNumber
    var testNumber: Int?
    

    // MARK: 알람, 알림 초기화
    @objc func initAlarm() {

        ref = Database.database().reference()
        
        
        ref.child("users").child(String(testNumber!)).queryOrdered(byChild: "order").queryLimited(toLast: 1).observeSingleEvent(of: .value, with: { (snapshot) in
          // Get user value
            let snapshotValue = snapshot.value as? [String : AnyObject] ?? [:]
            
            let order:Int?, setHour:Int?, setMin:Int?

            //first, watch value of 'order' key
            for (key, value as [String: AnyObject]) in snapshotValue{
                order = value["order"]
            }
            
            if order! >= 1 {
                targetHour = value?["alarm"] as? String ?? ""
            }
            
            
            

            // ...
            }) { (error) in
            print(error.localizedDescription)
        }
        
        // Make dismiss for all VC that was presented from this start VC
//        self.children.forEach({vc in
//            print("Dismiss \(vc.description)")
//            vc.dismiss(animated: false, completion: nil)
//        })
        
        
        //looper를 통해 무한하게 음악 재생하게 설정
        self.playerLooper = AVPlayerLooper(player: player, templateItem: songs[0])
        
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
        
        let session = AVAudioSession.sharedInstance()
        var _: Error?
        try? session.setCategory(AVAudioSession.Category.playAndRecord)
        try? session.setMode(AVAudioSession.Mode.voiceChat)
        
        try? session.overrideOutputAudioPort(AVAudioSession.PortOverride.speaker)
        
        try? session.setActive(true)
        

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

    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?)
    {
        if keyPath == "currentItem", let player = object as? AVPlayer,
        let currentItem = player.currentItem?.asset as? AVURLAsset {
        //        songLabel.text = currentItem.url.lastPathComponent
        }
    }

    //take song list
    private lazy var songs: [AVPlayerItem] = {
        let songNames = [fileName!]
        return songNames.map {
            let url = Bundle.main.url(forResource: $0, withExtension: fileType!)!
            return AVPlayerItem(url: url)
        }
    }()

    //make music player
    private func makePlayer() -> AVQueuePlayer {
        let player = AVQueuePlayer(items: songs)
        player.actionAtItemEnd = .advance
//        player.addObserver(self, forKeysPath: "currentItem", options: [.new, .initial] , context: nil)
        return player
    }

    @objc func pauseAlarm() {
        if isPlayConfirm{
            player.pause()
        }
    }
    
    @objc func confirmFromPopScreen(){
        isPop = false
        isAlarmRing = false
        shouldPop = false
    }
    
    @objc
    func isTimeToPop(_ callback: RCTResponseSenderBlock){
        callback([shouldPop])
    }
    
    //이전 알람 데이터를 확인해 flag들 조정
    @objc func checkAlarmCondition(){
        //알람이 아직 한번도 울리지 않았을 때
        if alarmDate == nil{
            
        }
        //알람이 울린적이 있을 때
        else{
            //알람이 울린 날과 현재 날짜가 동일한지 확인
            
            //현재 날짜 구하기
            var formatter = DateFormatter()
            formatter.dateFormat = "dd" // date format
            let nowDate = formatter.string(from: Date()) // get today's date
        
            print("checkAlarmCondition(): now date is \(alarmDate)")
            
            //동일 날짜, 알람이 이미 울림, 아직 popscreen에서 입력 없음
            if nowDate == alarmDate && isAlarmRing && !isPop{
                //popscreen을 띄워저야한다
                shouldPop = true
            }
            //다음날로 넘어가는 시점부터 혹은 popscreen에서 입력이 들어왔을 때
            else{
//                shouldPop = false
                isAlarmRing = false
                isPop = false
                player.pause()
                print("checkAlarmCondition(): player.pause() clear")
            }
            
            print("checkAlarmCondition(): isPop!!!!!!! \(isPop)")
        }
    }

    //update time data and check alarm
    @objc func updateTime(){
        var formatter = DateFormatter() // 특정 포맷으로 날짜를 보여주기 위한 변수 선언
        formatter.dateFormat = "HH" // hour format
        nowTimeHour = Int(formatter.string(from: Date()))

        formatter = DateFormatter() // 특정 포맷으로 날짜를 보여주기 위한 변수 선언
        formatter.dateFormat = "mm" // minute format
        nowTimeMinute = Int(formatter.string(from: Date()))

        formatter.dateFormat = "ss" // seconds format
        let nowSecond = formatter.string(from: Date())
        
        
        //get today's date
        formatter.dateFormat = "dd" // date format
        let nowDate = formatter.string(from: Date()) // get today's date
        
        print("hour=\(nowTimeHour!) minute=\(nowTimeMinute!) \(nowSecond) date=\(nowDate)flag=\(isPlayConfirm)")

        //update alarm flag
        checkAlarmCondition()
        
        
        print("updateTime(): checkAlarmCondition() clear")
        //check alarm is ring
        if(isAlarmRing){
            return
        }
        
        //타겟 시간이 존재할 때만 알람 체크
        if targetHour != nil && targetMinute != nil && !isPlayConfirm{
            //현재 시간과 타겟 시간이 같다면?
            print("\(nowTimeHour! == targetHour!) and \(nowTimeMinute! == targetMinute!)")
            if nowTimeHour! == targetHour! && nowTimeMinute! == targetMinute!{
                isPlayConfirm = true
                //volume MAX
                MPVolumeView.setVolume(1)
                
                print("playMusic(): volume up claer")
                //play music
                player.play()
                
                playMusic()
                print("in play!!")
                //call updateTime() after 60s
                //알람이 울린 후 알람 소리를 멈추면 60초 후부터 타겟 시간 확인하게 하기
                Timer.scheduledTimer(timeInterval: 60.0, target: self, selector: #selector(timerOn), userInfo: nil, repeats: false)
                isAlarmRing = true
                
                
                //suspend app
                UIControl().sendAction(#selector(URLSessionTask.suspend), to: UIApplication.shared, for: nil)
            }
        }
        
        print()
    }
    
    //알람 소리 재생
    func playMusic(){
        
        
        print("playMusic(): play clear")
        //get file url
        let pathString:NSURL? = getFileUrl()
        
        let asset = AVURLAsset(url: pathString! as URL, options: nil)
        let audioDuration = asset.duration
        let audioDurationSeconds = CMTimeGetSeconds(audioDuration)

        //get length of music file
        let musicLength:Double = audioDurationSeconds

        print(musicLength)
        
        //repeat 10 times
        Timer.scheduledTimer(timeInterval: musicLength*10, target: self, selector: #selector(stopMusic), userInfo: nil, repeats: false)
        print("playMusic(): schedule clear")
    }

    //알라 소리 멈추기
    @objc func stopMusic(){
        if(isPlayConfirm){
            print("stopMusic(): stop!!!!")
            player.pause()
        }
    }
    
    @objc func getFileUrl() -> NSURL? {
        
        let path = Bundle.main.path(forResource: fileName!, ofType: fileType!)
        if let path = path {
                return NSURL(fileURLWithPath:path)
        } else {
                return nil
        }
    }
    
    //init flag
    @objc func timerOn(){
        isPlayConfirm = false
        player.pause()
        player.seek(to: CMTime.zero)
    }

    //타겟 시간(알람 시간) 설정
    @objc func setAlarmTime(_ hour:NSInteger, minute:NSInteger) -> Void{
        //swift datepicker에서 날짜, 시간 정보 가져오기
        //        let datepickerComponent = Calendar.current.dateComponents([.hour, .minute], from:myDatePicker.date)
        print("-----Alarm Set!!------")
        print("alarm time: \(hour), \(minute)")
        targetHour = hour
        targetMinute = minute
        
        //get today's date
        //it's date when alarm is set
        var formatter = DateFormatter()
        formatter.dateFormat = "dd" // date format
        alarmDate = formatter.string(from: Date()) // get today's date
        
        print("alarm date is \(alarmDate)")
    }
    
    //상시 알람 시간 확인
    @objc func checkAlarm(_ name:NSString, number:NSInteger) -> Void{
        let notificationCenter = NotificationCenter.default
        notificationCenter.addObserver(self, selector: #selector(appMovedToBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)

        fullFileName = String(name)
        
        //split full file name
        let arr = fullFileName!.components(separatedBy: ".")
        fileName = arr[0]
        fileType = arr[1]
        
        //set testnumber
        testNumber = number
        
        DispatchQueue.main.async(execute: {
            self.initAlarm()
        })
    }

    @objc func appMovedToBackground() {
        makeNotification()
    }



    //MARK:set alarm and notification
    @objc func makeNotification() {

        print("make notification")

        //Setting content of the notification
        let content = UNMutableNotificationContent()
        content.title = "주의사항!!"
        content.subtitle = "⭐️⭐️⭐️⭐️⭐️⭐️⭐️"
        content.body = "백그라운드에서 종료 시 무음모드에서 소리가 나지 않습니다!"
        content.summaryArgument = "skku"
        content.summaryArgumentCount = 40
        content.sound = UNNotificationSound.default
//        let soundName = UNNotificationSoundName(rawValue: "Self-voice.aiff")
//        content.sound = UNNotificationSound.init(named: soundName)

        //Setting time for notification trigger
        //블로그 예제에서는 TimeIntervalNotificationTrigger을 사용했지만, UNCalendarNotificationTrigger사용법도 같이 올려놓을게요!

        //1. Use UNCalendarNotificationTrigger
        let date = Date()
        var dateCompenents = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)


        dateCompenents.hour = targetHour
        dateCompenents.minute = targetMinute
        //        dateCompenents.second = 0


        let calendartrigger = UNCalendarNotificationTrigger(dateMatching: dateCompenents, repeats: true)


        //2. Use TimeIntervalNotificationTrigger
        //시간 간격을 두고 time trigger 발생
        let TimeIntervalTrigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.1, repeats: false)

        //Adding Request
        // MARK: - identifier가 다 달라야만 Notification Grouping이 됩니닷..!!
        let request = UNNotificationRequest(identifier: "\(index)timerdone", content: content, trigger: TimeIntervalTrigger)

        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)

    }
}

